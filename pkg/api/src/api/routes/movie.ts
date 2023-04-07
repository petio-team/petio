import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { company, discoverMovie, movieLookup } from '@/services/tmdb/movie';

const lookupById = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await movieLookup(ctx.params.id);
};

const lookupByIdMinified = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await movieLookup(ctx.params.id, true);
};

const getMovieDiscovery = async (ctx: Context) => {
  const body = ctx.request.body as any;

  const page = body.page ? body.page : 1;
  const {params} = body;

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