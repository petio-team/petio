import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import logger from '@/loaders/logger';
import { UserModel } from '@/models/user';
import getDiscovery from '@/services/discovery/display';

const getMovies = async (ctx: Context) => {
  const user = await UserModel.findOne({ id: ctx.state.user.id });

  if (!user) {
    ctx.state = StatusCodes.NOT_FOUND;
    return;
  }

  const userId = user.altId ? user.altId : user.plexId;

  try {
    logger.verbose(`ROUTE: Movie Discovery Profile returned for ${userId}`);
    const data: any = await getDiscovery(userId, 'movie');
    if (data.error) throw data.error;
    ctx.body = data;
  } catch (err) {
    logger.error(err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const getShows = async (ctx: Context) => {
  const user = await UserModel.findOne({ id: ctx.state.user.id });

  if (!user) {
    ctx.state = StatusCodes.NOT_FOUND;
    return;
  }

  const userId = user.altId ? user.altId : user.plexId;

  try {
    logger.verbose(`ROUTE: TV Discovery Profile returned for ${userId}`);
    const data: any = await getDiscovery(userId, 'show');
    if (data.error) throw data.error;

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (err) {
    logger.error(err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const route = new Router({ prefix: '/discovery' });
export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};
