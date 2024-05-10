import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { adminRequired } from '@/api/middleware/auth';
import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import { MediaServerRepository } from '@/resources/media-server/repository';
import getSessions from '@/services/plex/sessions';
import is from '@/utils/is';

const getSessionsData = async (ctx: Context) => {
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
    const data = await getSessions(server);
    if (!is.truthy(data)) {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = 'failed to get sessions';
      return;
    }

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
