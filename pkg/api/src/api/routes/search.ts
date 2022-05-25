import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { authRequired } from '@/api/middleware/auth';
import logger from '@/loaders/logger';
import search from '@/tmdb/search';

const route = new Router({ prefix: '/search' });

export default (app: Router) => {
  route.get('/:term', searchByTerm);

  app.use(route.routes());
};

const searchByTerm = async (ctx: Context) => {
  try {
    let data = await search(ctx.params.term.replace(/[^a-zA-Z0-9 ]/g, ''));

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (err) {
    logger.error(err);

    ctx.status = StatusCodes.OK;
    ctx.body = {
      movies: [],
      people: [],
      shows: [],
    };
  }
};
