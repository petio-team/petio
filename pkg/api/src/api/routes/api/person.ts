import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import personLookup from '@/services/tmdb/person';

// const cacheMiddleware = new ExpressCache(
//   cacheManager.caching({
//     store: "memory",
//     max: 100,
//     ttl: 86400, // Cache for 1 day
//   })
// );

const lookupById = async (ctx: Context) => {
  const data = await personLookup(ctx.params.id);

  ctx.status = StatusCodes.OK;
  ctx.body = data;
};

const route = new Router({ prefix: '/person' });

export default (app: Router) => {
  route.get('/lookup/:id', lookupById);

  app.use(route.routes());
};