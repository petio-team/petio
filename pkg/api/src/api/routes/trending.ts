import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import trending from '@/tmdb/trending';

const route = new Router({ prefix: '/trending' });

export default (app: Router) => {
  route.get('/', getTrending);

  app.use(route.routes());
};

const getTrending = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await trending();
};
