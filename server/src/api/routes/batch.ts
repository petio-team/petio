import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { getFromContainer } from '@/infrastructure/container/container';
import { MovieService } from '@/services/movie/movie';
import { ShowService } from '@/services/show/show';

const handleTv = async (ctx: Context) => {
  const { ids } = ctx.request.body;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  const output = await getFromContainer(ShowService).getBatchedShows(ids, min);

  ctx.status = StatusCodes.OK;
  ctx.body = output;
};

const handleMovie = async (ctx: Context) => {
  const { ids } = ctx.request.body;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  const output = await getFromContainer(MovieService).getBatchedMovies(
    ids,
    min,
  );
  ctx.status = StatusCodes.OK;
  ctx.body = output;
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
