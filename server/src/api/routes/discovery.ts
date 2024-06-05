/* eslint-disable import/order */
import Router from '@koa/router';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { DiscoveryService } from '@/services/discovery/discovery';

import { StatusInternalServerError, StatusOk } from '../http/request';

const getMovies = async (ctx: Context) => {
  try {
    const service = getFromContainer(DiscoveryService);
    const data = await service.getMovies(ctx.state.user.id);
    if (!data) {
      StatusOk(ctx, []);
      return;
    }
    StatusOk(ctx, [data]);
  } catch (err) {
    logger.error(`failed to get discovery data for movies`, err);
    StatusInternalServerError(ctx, 'Could not get movie discovery data');
  }
};

const getShows = async (ctx: Context) => {
  try {
    const service = getFromContainer(DiscoveryService);
    const data = await service.getShows(ctx.state.user.id);
    if (!data) {
      StatusOk(ctx, []);
      return;
    }
    StatusOk(ctx, [data]);
  } catch (err) {
    logger.error(`failed to get discovery data for shows`, err);
    StatusInternalServerError(ctx, 'Could not get show discovery data');
  }
};

const route = new Router({ prefix: '/discovery' });
export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};
