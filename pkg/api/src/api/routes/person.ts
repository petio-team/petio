import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import personLookup from '@/services/tmdb/person';

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
