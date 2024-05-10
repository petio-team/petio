import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import is from '@/infra/utils/is';
import { MediaServerRepository } from '@/resources/media-server/repository';
import { UserRepository } from '@/resources/user/repository';
import { getPlexClient } from '@/services/plex/client';
import plexLookup from '@/services/plex/lookup';

const lookupByIdAndType = async (ctx: Context) => {
  const { type } = ctx.params;
  const { id } = ctx.params;
  if (!type || !id || type === 'undefined' || type === 'undefined') {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = { error: 'invalid fields provided' };
  } else {
    ctx.status = StatusCodes.OK;
    ctx.body = await plexLookup(id, type);
  }
};

const testPlexConnection = async (ctx: Context) => {
  const userRepo = getFromContainer(UserRepository);
  const serverRepo = getFromContainer(MediaServerRepository);

  try {
    const [userResult, serverResult] = await Promise.all([
      userRepo.findOne({ owner: true }),
      serverRepo.findOne({}),
    ]);
    if (userResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = 'no admin user could be found';
      return;
    }
    if (serverResult.isNone()) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = 'no server could be found';
      return;
    }
    const user = userResult.unwrap();
    const server = serverResult.unwrap();

    const plexServer = await getPlexClient(
      server,
    ).server.getServerCapabilities();
    const data = plexServer.MediaContainer;
    if (is.falsy(data)) {
      ctx.status = StatusCodes.BAD_REQUEST;
      ctx.body = {
        connection: false,
        error: 'Plex connection test failed',
      };
      return;
    }
    if (
      data.myPlexUsername === user.username ||
      data.myPlexUsername === user.email
    ) {
      ctx.status = StatusCodes.OK;
      ctx.body = {
        connection: true,
        error: false,
      };
      return;
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
      connection: false,
      error: 'You are not the owner of this server',
    };
    return;
  } catch (err) {
    logger.error('Plex connection test failed', err);

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {
      connection: false,
      error: 'Plex connection test failed',
    };
  }
};

const route = new Router({ prefix: '/plex' });
export default (app: Router) => {
  route.get('/lookup/:type/:id', lookupByIdAndType);
  route.get('/test_plex', testPlexConnection);

  app.use(route.routes());
};
