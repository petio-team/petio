import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import getTop from '@/services/plex/top';

// Cache for 1 day
// const cacheMiddleware = new ExpressCache(
//   cacheManager.caching({
//     store: "memory",
//     max: 100,
//     ttl: 86400,
//   })
// );
// cacheMiddleware.attach(route);

const getMovies = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await getTop(1);
};

const getShows = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await getTop(2);
};

const route = new Router({ prefix: '/top' });
export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};