import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { adminRequired } from '@/api/middleware/auth';
import logger from '@/loaders/logger';
import getSessions from '@/services/plex/sessions';

const route = new Router({ prefix: '/sessions' });

export default (app: Router) => {
  route.get('/', getSessionsData);

  app.use(route.routes());
};

const getSessionsData = async (ctx: Context) => {
  try {
    const data = await getSessions();

    ctx.status = StatusCodes.OK;
    ctx.body = data.MediaContainer;
  } catch (err) {
    logger.log('warn', 'ROUTE: Unable to get sessions');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};
