import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import { MediaServerRepository } from '@/resources/media-server/repository';
import getBandwidth from '@/services/plex/bandwidth';
import { getPlexClient } from '@/services/plex/client';
import getHistory from '@/services/plex/history';
import getServerInfo from '@/services/plex/serverInfo';

const listHistory = async (ctx: Context) => {
  let { id } = ctx.request.body;
  if (id === 'admin') {
    id = 1;
  }
  try {
    const serverRepo = getFromContainer(MediaServerRepository);
    const serverResult = await serverRepo.findOne({});
    if (serverResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = `failed to find server`;
      return;
    }
    const server = serverResult.unwrap();
    const client = getPlexClient(server);
    await getHistory(client, id, ctx.request.body.type);
    ctx.status = StatusCodes.OK;
    // ctx.body = data;
    ctx.body = [];
  } catch (err) {
    logger.error('ROUTE: Error getting history', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const getServerData = async (ctx: Context) => {
  try {
    const serverRepo = getFromContainer(MediaServerRepository);
    const serverResult = await serverRepo.findOne({});
    if (serverResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = `failed to find server`;
      return;
    }
    const server = serverResult.unwrap();
    const client = getPlexClient(server);
    const data = await getServerInfo(client);
    if (!data) {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = `failed to get server info`;
      return;
    }
    ctx.body = data.MediaContainer;
  } catch (err) {
    logger.error('ROUTE: Error getting server info', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const collectBandwidth = async (ctx: Context) => {
  try {
    const serverRepo = getFromContainer(MediaServerRepository);
    const serverResult = await serverRepo.findOne({});
    if (serverResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = `failed to find server`;
      return;
    }
    const server = serverResult.unwrap();
    ctx.body = await getBandwidth(server);
  } catch (err) {
    logger.error('ROUTE: Error getting bandwidth', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const route = new Router({ prefix: '/history' });
export default (app: Router) => {
  route.post('/', listHistory);
  route.get('/server', getServerData);
  route.get('/bandwidth', collectBandwidth);

  app.use(route.routes());
};
