/* eslint-disable import/order */
import Router from '@koa/router';
import { Context } from 'koa';

import logger from '@/loaders/logger';
import { UserModel } from '@/models/user';
import cache from '@/services/cache/cache';
import { DiscoveryResult } from '@/services/discovery/display';

import {
  StatusBadRequest,
  StatusInternalServerError,
  StatusOk,
} from '../http/request';

const getMovies = async (ctx: Context) => {
  const user = await UserModel.findById(ctx.state.user.id);
  if (!user) {
    StatusBadRequest(ctx, 'Could not get discovery by authed user');
    return;
  }

  const userId = user.altId ? user.altId : user.plexId;

  try {
    logger.debug(`ROUTE: Movie Discovery Profile returned for ${userId}`);
    const cachedData = (await cache.get(
      `discovery.user.movie.${userId}`,
    )) as DiscoveryResult | null;
    if (!cachedData) {
      StatusOk(ctx, {
        message: 'No discovery data found for user',
      });
      return;
    }
    StatusOk(ctx, cachedData);
    return;
  } catch (err) {
    logger.error(err);
    StatusInternalServerError(ctx, 'Could not get movie discovery data');
  }
};

const getShows = async (ctx: Context) => {
  const user = await UserModel.findById(ctx.state.user.id);
  if (!user) {
    StatusBadRequest(ctx, 'Could not get discovery by authed user');
    return;
  }

  const userId = user.altId ? user.altId : user.plexId;

  try {
    logger.debug(`ROUTE: TV Discovery Profile returned for ${userId}`);
    const cachedData = (await cache.get(
      `discovery.user.show.${userId}`,
    )) as DiscoveryResult | null;
    if (!cachedData) {
      StatusBadRequest(ctx, 'No discovery data found');
      return;
    }
    StatusOk(ctx, cachedData);
    return;
  } catch (err) {
    logger.error(err);
    StatusInternalServerError(ctx, 'Could not get show discovery data');
  }
};

const route = new Router({ prefix: '/discovery' });
export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};
