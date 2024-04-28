import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import getTop from '@/services/plex/top';

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
