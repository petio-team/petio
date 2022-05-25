import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import getTop from '@/plex/top';

// Cache for 1 day
// const cacheMiddleware = new ExpressCache(
//   cacheManager.caching({
//     store: "memory",
//     max: 100,
//     ttl: 86400,
//   })
// );

const route = new Router({ prefix: '/top' });
// cacheMiddleware.attach(route);

export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};

const getMovies = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await getTop(1);
};

const getShows = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await getTop(2);
};
