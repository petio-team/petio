import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import { MediaServerRepository } from '@/resources/media-server/repository';
import getTop from '@/services/plex/top';

const getMovies = async (ctx: Context) => {
  try {
    const serverResult = await getFromContainer(MediaServerRepository).findOne(
      {},
    );
    if (serverResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = 'failed to find server';
      return;
    }
    const server = serverResult.unwrap();
    ctx.status = StatusCodes.OK;
    ctx.body = await getTop(server, 1);
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const getShows = async (ctx: Context) => {
  try {
    const serverResult = await getFromContainer(MediaServerRepository).findOne(
      {},
    );
    if (serverResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = 'failed to find server';
      return;
    }
    const server = serverResult.unwrap();
    ctx.status = StatusCodes.OK;
    ctx.body = await getTop(server, 2);
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
  }
};

const route = new Router({ prefix: '/top' });
export default (app: Router) => {
  route.get('/movies', getMovies);
  route.get('/shows', getShows);

  app.use(route.routes());
};
