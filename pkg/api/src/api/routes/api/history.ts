import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import logger from '@/loaders/logger';
import getBandwidth from '@/services/plex/bandwidth';
import getHistory from '@/services/plex/history';
import getServerInfo from '@/services/plex/serverInfo';

const route = new Router({ prefix: '/history' });

export default (app: Router) => {
  route.post('/', listHistory);
  route.get('/server', getServerData);
  route.get('/bandwidth', collectBandwidth);

  app.use(route.routes());
};

const listHistory = async (ctx: Context) => {
  let {id} = ctx.request.body;
  if (id === 'admin') id = 1;
  try {
    const data = await getHistory(id, ctx.request.body.type);
    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (err) {
    logger.log('warn', 'ROUTE: Error getting history');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const getServerData = async (ctx: Context) => {
  try {
    const data = await getServerInfo();
    ctx.body = data.MediaContainer;
  } catch (err) {
    logger.log('warn', 'ROUTE: Error getting server info');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

const collectBandwidth = async (ctx: Context) => {
  try {
    ctx.body = await getBandwidth();
  } catch (err) {
    logger.log('warn', 'ROUTE: Error getting bandwidth');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
};
