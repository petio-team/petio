import Router from '@koa/router';
import { Context } from 'koa';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const handleTv = async (ctx: Context) => {
  const { ids } = ctx.request.body;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  const output = await Promise.all(
    ids.map(async (id) => {
      const value = id ? showLookup(id, min) : undefined;
      return value;
    }),
  );

  ctx.body = output;
};

const handleMovie = async (ctx: Context) => {
  const { ids } = ctx.request.body;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  const output = await Promise.all(
    ids.map(async (id): Promise<any> => {
      const value = id ? movieLookup(id, min) : undefined;
      return value;
    }),
  );

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
