import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { validateRequest } from '@/api/middleware/validation';
import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import { PlexClient } from '@/infra/plex';
import { Worker } from '@/infra/worker/worker';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { MediaServerRepository } from '@/resources/media-server/repository';
import { MediaServerType } from '@/resources/media-server/types';
import { UserEntity } from '@/resources/user/entity';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';
import { SetupTestInput, SetupTestInputSchema } from '@/schemas/setup';
import { SettingsService } from '@/services/settings/settings';
import { generateKeys } from '@/utils/security';

const testServer = async (ctx: Context) => {
  const body = ctx.request.body as SetupTestInput;

  const { server } = body;
  if (!server) {
    logger.warn('Test Server bad request');

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = 'bad request';
    return;
  }
  logger.debug(
    `Testing Server ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`,
  );
  try {
    const client = new PlexClient({
      BASE: `${server.protocol}://${server.host}:${server.port}`,
      HEADERS: {
        'X-Plex-Token': server.token,
      },
    });
    await client.server.getServerCapabilities();
    logger.debug(
      `Test Server success - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`,
    );
    ctx.status = StatusCodes.OK;
    ctx.body = {
      status: 'connected',
      code: 200,
    };
  } catch (err) {
    logger.debug(
      `Test Server failed - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`,
    );
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {
      status: 'failed',
      code: 400,
    };
  }
};

const testMongo = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = {
    status: 'connected',
  };
};

const finishSetup = async (ctx: Context) => {
  const { body } = ctx.request;

  const { user } = body;
  const { server } = body;
  const dbUrl = body.db;
  if (!user || !server || !dbUrl) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'missing fields';
    return;
  }

  await getFromContainer(MediaServerRepository).findOneOrCreate(
    MediaServerEntity.create({
      name: 'default',
      type: MediaServerType.PLEX,
      url: `${server.protocol}://${server.host}:${server.port}`,
      token: server.token,
      metadata: {
        clientId: server.clientId,
      },
      enabled: true,
    }),
  );

  try {
    const keys = generateKeys(10);
    await Promise.all([
      getFromContainer(UserRepository).findOrCreate(
        UserEntity.create({
          title: user.display ?? user.username,
          username: user.username,
          password: bcrypt.hashSync(user.password, 10),
          email: user.email,
          thumbnail: user.thumb,
          altId: '1',
          plexId: user.id,
          lastIp: ctx.ip,
          role: UserRole.ADMIN,
          owner: true,
        }),
      ),
      getFromContainer(SettingsService).updateSettings({
        initialSetup: true,
        appKeys: keys,
      }),
    ]);

    logger.info('restarting to apply new configurations');
    await getFromContainer(Worker).getReciever().restartWorkers();

    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error('Config creation error', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'error creating config';
  }
};

const route = new Router({ prefix: '/setup' });
export default (app: Router) => {
  route.post(
    '/test_server',
    validateRequest({
      body: SetupTestInputSchema,
    }),
    testServer,
  );
  route.post('/test_mongo', testMongo);
  route.post('/set', finishSetup);

  app.use(route.routes());
};
