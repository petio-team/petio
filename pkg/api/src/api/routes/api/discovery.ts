import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import getDiscovery from '@/discovery/display';
import logger from '@/loaders/logger';

const route = new Router({ prefix: '/discovery' });

export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};

const getMovies = async (ctx: Context) => {
  const userId = ctx.state.user.altId
    ? ctx.state.user.altId
    : ctx.state.user.id;
  if (!userId) {
    ctx.state = StatusCodes.NOT_FOUND;
    return;
  }
  try {
    logger.verbose(`ROUTE: Movie Discovery Profile returned for ${userId}`);
    let data: any = await getDiscovery(userId, 'movie');
    if (data.error) throw data.error;
    ctx.body = data;
  } catch (err) {
    logger.error(err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const getShows = async (ctx: Context) => {
  const userId = ctx.state.user.altId
    ? ctx.state.user.altId
    : ctx.state.user.id;
  if (!userId) {
    ctx.state = StatusCodes.NOT_FOUND;
    return;
  }
  try {
    logger.verbose(`ROUTE: TV Discovery Profile returned for ${userId}`);
    let data: any = await getDiscovery(userId, 'show');
    if (data.error) throw data.error;

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (err) {
    logger.error(err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};
