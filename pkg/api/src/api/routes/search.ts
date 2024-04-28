import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import logger from '@/infra/logger/logger';
import search from '@/services/tmdb/search';

const searchByTerm = async (ctx: Context) => {
  try {
    const data = await search(ctx.params.term.replace(/[^a-zA-Z0-9 ]/g, ''));

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

const route = new Router({ prefix: '/search' });
export default (app: Router) => {
  route.get('/:term', searchByTerm);

  app.use(route.routes());
};
