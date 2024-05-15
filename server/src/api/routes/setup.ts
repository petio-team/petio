import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { SetupTestInput, SetupTestInputSchema } from '@/api/schemas/setup';
import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { SetupService } from '@/services/setup/setup';

const testServer = async (ctx: Context) => {
  const body = ctx.request.body as SetupTestInput;
  const { server } = body;
  const service = getFromContainer(SetupService);
  const connected = await service.testServerConnection(server);
  if (connected) {
    ctx.status = StatusCodes.OK;
    ctx.body = {
      status: 'connected',
      code: 200,
    };
  } else {
    ctx.status = StatusCodes.OK;
    ctx.body = {
      status: 'failed',
      code: 400,
    };
  }
};

const FinishSetupBodySchema = z.object({
  user: z.object({
    password: z.string().min(8),
  }),
  server: z.object({
    protocol: z.enum(['http', 'https']),
    host: z.string().min(1),
    port: z.coerce.number(),
    token: z.string().min(1),
  }),
});
type FinishSetupBody = z.infer<typeof FinishSetupBodySchema>;

const finishSetup = async (ctx: Context) => {
  const body = ctx.request.body as FinishSetupBody;
  const { server, user } = body;

  try {
    const service = getFromContainer(SetupService);

    await Promise.all([
      service.createAdminUser({
        token: server.token,
        password: user.password,
        ip: ctx.ip,
      }),
      service.createMediaServer({
        protocol: server.protocol,
        host: server.host,
        port: server.port,
        token: server.token,
      }),
      service.updateSettings(),
    ]);

    service.restartWorkers();

    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error('failed to finish setup', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'error creating config';
  }
};

const getPlexUser = async (ctx: Context) => {
  const { token } = ctx.request.body;
  const service = getFromContainer(SetupService);

  try {
    const user = await service.getPlexUser(token);
    if (!user) {
      ctx.status = StatusCodes.OK;
      ctx.body = {
        message: 'failed to get user',
      };
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
      message: 'success',
      data: user,
    };
  } catch (err) {
    logger.error('failed to get plex user', err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'error getting plex user';
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
  route.post(
    '/set',
    validateRequest({
      body: FinishSetupBodySchema,
    }),
    finishSetup,
  );
  route.post(
    '/plex/user',
    validateRequest({
      body: z.object({
        token: z.string(),
      }),
    }),
    getPlexUser,
  );

  app.use(route.routes());
};
