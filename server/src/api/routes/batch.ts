import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { getFromContainer } from '@/infrastructure/container/container';
import { MovieMapper } from '@/resources/movie/mapper';
import { ShowMapper } from '@/resources/show/mapper';
import { MovieService } from '@/services/movie/movie-service';
import { ShowService } from '@/services/show/show-service';

const handleTv = async (ctx: Context) => {
  const service = getFromContainer(ShowService);
  const mapper = getFromContainer(ShowMapper);

  const { ids } = ctx.request.body;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;

  const output = await service.getBatchedShows(ids, min);

  ctx.status = StatusCodes.OK;
  ctx.body = output.map((show) => mapper.toResponse(show));
};

const handleMovie = async (ctx: Context) => {
  const service = getFromContainer(MovieService);
  const mapper = getFromContainer(MovieMapper);

  const { ids } = ctx.request.body;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  const output = await service.getBatchedMovies(ids, min);

  ctx.status = StatusCodes.OK;
  ctx.body = output.map((movie) => mapper.toResponse(movie));
};

const route = new Router({ prefix: '/batch' });
export default (app: Router) => {
  route.post(
    '/movie',
    validateRequest({
      body: z.object({
        ids: z.array(z.number()),
        min: z.boolean().optional(),
      }),
    }),
    handleMovie,
  );
  route.post(
    '/tv',
    validateRequest({
      body: z.object({
        ids: z.array(z.number()),
        min: z.boolean().optional(),
      }),
    }),
    handleTv,
  );

  app.use(route.routes());
};
