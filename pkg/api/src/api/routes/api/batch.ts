import Router from '@koa/router';
import { Context } from 'koa';
import { z } from 'zod';

import { movieLookup } from '@/tmdb/movie';
import { showLookup } from '@/tmdb/show';

import { validateRequest } from '@/api/middleware/validation';

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

const handleTv = async (ctx: Context) => {
  const ids = ctx.request.body.ids;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      return showLookup(id, min);
    }),
  );

  ctx.body = output;
};

const handleMovie = async (ctx: Context) => {
  const ids = ctx.request.body.ids;
  const min = ctx.request.body.min === undefined ? true : ctx.request.body.min;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      return movieLookup(id, min);
    }),
  );

  ctx.body = output;
};
