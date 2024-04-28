import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { adminRequired } from '@/api/middleware/auth';
import logger from '@/infra/logger/logger';
import getSessions from '@/services/plex/sessions';

const getSessionsData = async (ctx: Context) => {
  try {
    const data = await getSessions();

    ctx.status = StatusCodes.OK;
    ctx.body = data.MediaContainer;
  } catch (err) {
    logger.error('ROUTE: Unable to get sessions', err);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const route = new Router({ prefix: '/sessions' });
export default (app: Router) => {
  route.get('/', adminRequired, getSessionsData);

  app.use(route.routes());
};
