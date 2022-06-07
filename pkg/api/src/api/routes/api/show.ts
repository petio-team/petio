import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { discoverSeries, network, showLookup } from '@/tmdb/show';

const route = new Router({ prefix: '/show' });

export default (app: Router) => {
  route.get('/lookup/:id', lookupById);
  route.get('/lookup/:id/minified', lookupByIdMinified);
  route.post('/discover', discoverSeriesData);
  route.get('/network/:id', getNetworkById);

  app.use(route.routes());
};

const lookupById = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await showLookup(ctx.params.id, false);
};

const lookupByIdMinified = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await showLookup(ctx.params.id, true);
};

const discoverSeriesData = async (ctx: Context) => {
  const body = ctx.request.body as any;

  let page = body.page ? body.page : 1;
  let params = body.params;

  ctx.status = StatusCodes.OK;
  ctx.body = await discoverSeries(page, params);
};

const getNetworkById = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await network(ctx.params.id);
};
