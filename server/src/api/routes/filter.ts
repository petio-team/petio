import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { FilterService } from '@/services/filter/filter';

import { validateRequest } from '../middleware/validation';

const getFilters = async (ctx: Context) => {
  try {
    ctx.ok({});
  } catch (err) {
    logger.error(err, 'FILTER: Unable to load filters');
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const updateFilter = async (ctx: Context) => {
  const { body } = ctx.request;

  const movieFilter = body.movie;
  const tvFilter = body.tv;

  try {
    const service = getFromContainer(FilterService);
    await Promise.all([
      service.updateMovieFilter(movieFilter),
      service.updateShowFilter(tvFilter),
    ]);
    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error('failed to update filters', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const route = new Router({ prefix: '/filter' });
export default (app: Router) => {
  route.get('/', getFilters);
  route.post(
    '/update',
    validateRequest({
      body: z.object({
        movie: z.object({
          type: z.string(),
          filters: z.array(
            z.object({
              condition: z.string(),
              operator: z.string(),
              value: z.string(),
              comparison: z.string(),
            }),
          ),
          actions: z.array(
            z.object({
              server: z.string(),
              path: z.string(),
              profile: z.string(),
              language: z.string(),
              tag: z.string(),
              type: z.string().optional(),
            }),
          ),
          collapse: z.boolean(),
        }),
        tv: z.object({
          type: z.string(),
          filters: z.array(
            z.object({
              condition: z.string(),
              operator: z.string(),
              value: z.string(),
              comparison: z.string(),
            }),
          ),
          actions: z.array(
            z.object({
              server: z.string(),
              path: z.string(),
              profile: z.string(),
              language: z.string(),
              tag: z.string(),
              type: z.string().optional(),
            }),
          ),
          collapse: z.boolean(),
        }),
      }),
    }),
    updateFilter,
  );

  app.use(route.routes());
  app.use(route.allowedMethods());
};
