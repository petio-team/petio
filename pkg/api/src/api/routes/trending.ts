import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import trending from '@/services/tmdb/trending';

const getTrending = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await trending();
};

const route = new Router({ prefix: '/trending' });
export default (app: Router) => {
  route.get('/', getTrending);

  app.use(route.routes());
};
