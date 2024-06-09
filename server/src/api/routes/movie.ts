import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import { MovieMapper } from '@/resources/movie/mapper';
import { MovieService } from '@/services/movie/movie-service';
import { company, discoverMovie } from '@/services/tmdb/movie';

const lookupById = async (ctx: Context) => {
  const service = getFromContainer(MovieService);
  const mapper = getFromContainer(MovieMapper);
  const details = await service.getMovie(ctx.params.id, {
    withArtwork: true,
    withServer: true,
    withRating: true,
  });
  if (details.isNone()) {
    ctx.status = StatusCodes.NOT_FOUND;
    return;
  }
  ctx.status = StatusCodes.OK;
  ctx.body = mapper.toResponse(details.unwrap());
};

const lookupByIdMinified = async (ctx: Context) => {
  const service = getFromContainer(MovieService);
  const mapper = getFromContainer(MovieMapper);
  const details = await service.getMovie(ctx.params.id, {
    withArtwork: false,
    withServer: true,
    withRating: false,
  });
  if (details.isNone()) {
    ctx.status = StatusCodes.NOT_FOUND;
    return;
  }
  ctx.status = StatusCodes.OK;
  ctx.body = mapper.toResponse(details.unwrap());
};

const getMovieDiscovery = async (ctx: Context) => {
  const body = ctx.request.body as any;

  const page = body.page ? body.page : 1;
  const { params } = body;

  ctx.status = StatusCodes.OK;
  ctx.body = await discoverMovie(page, params);
};

const getCompanyById = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await company(ctx.params.id);
};

const route = new Router({ prefix: '/movie' });
export default (app: Router) => {
  route.get('/lookup/:id', lookupById);
  route.get('/lookup/:id/minified', lookupByIdMinified);
  route.post('/discover', getMovieDiscovery);
  route.get('/company/:id', getCompanyById);

  app.use(route.routes());
};
