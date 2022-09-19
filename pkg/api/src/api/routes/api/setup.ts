import Router from '@koa/router';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import mongoose from 'mongoose';

import { validateRequest } from '@/api/middleware/validation';
import { SetupTestInput, SetupTestInputSchema } from '@/api/schemas/setup';
import { WriteConfig, config } from '@/config/index';
import logger from '@/loaders/logger';
import { CreateOrUpdateUser, UserRole } from '@/models/user';
import testConnection from '@/services/plex/connection';

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

const testServer = async (ctx: Context) => {
  const body = ctx.request.body as SetupTestInput;

  const {server} = body;
  if (!server) {
    logger.log('warn', 'Test Server bad request');

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = 'bad request';
    return;
  }
  logger.log(
    'verbose',
    `Testing Server ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`,
  );
  try {
    const test = await testConnection(
      server.protocol,
      server.host,
      server.port,
      server.token,
    );
    const status = test !== 200 ? 'failed' : 'connected';
    logger.log(
      'verbose',
      `Test Server success - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`,
    );

    ctx.status = StatusCodes.OK;
    ctx.body = {
      status,
      code: test,
    };
  } catch (err) {
    logger.log(
      'verbose',
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
  const {body} = ctx.request;

  const {mongo} = body;
  logger.log('verbose', `testing mongo connection: ${mongo}`);
  if (!mongo) {
    logger.log('warn', 'Mongo test bad request');

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = 'bad request';
    return;
  }
  try {
    // Ensure no db is passed
    if (mongo.split('@').length > 1) {
      if (mongo.split('@')[1].split('/').length > 1) {
        ctx.status = StatusCodes.UNAUTHORIZED;
        ctx.body = {
          status: 'failed',
          error: 'db path included',
          tried: mongo,
          l: mongo.split('@')[1].split('/').length,
        };

        logger.log('warn', 'Mongo test db path included');
        return;
      }
    }
    logger.log('verbose', 'Attempting mongo connection');

    await mongoose.disconnect();
    await mongoose.connect(`${mongo  }/petio`);

    ctx.status = StatusCodes.OK;
    ctx.body = {
      status: 'connected',
    };

    logger.log('verbose', 'Mongo test connection success');
  } catch (err) {
    ctx.status = StatusCodes.UNAUTHORIZED;
    ctx.body = {
      status: 'failed',
      error: err,
      tried: mongo,
    };

    logger.log('warn', 'Mongo test connection failed');
  }
};

const finishSetup = async (ctx: Context) => {
  logger.log('verbose', 'Attempting to create config file');

  const {body} = ctx.request;

  const {user} = body;
  const {server} = body;
  const dbUrl = body.db;
  if (!user || !server || !dbUrl) {
    logger.log('warn', 'Config creation missing fields');

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'missing fields';
    return;
  }

  config.set('db.url', `${dbUrl  }/petio`);
  config.set('plex.protocol', server.protocol);
  config.set('plex.host', server.host);
  config.set('plex.port', server.port);
  config.set('plex.token', server.token);
  config.set('plex.client', server.clientId);

  try {
    await CreateOrUpdateUser({
      title: user.display ?? user.username,
      username: user.username,
      password: bcrypt.hashSync(user.password, 10),
      email: user.email,
      thumbnail: user.thumb,
      altId: '1',
      plexId: user.id,
      lastIp: ctx.ip,
      role: UserRole.Admin,
      owner: true,
      custom: false,
      disabled: false,
      quotaCount: 0,
    });

    await WriteConfig(false);
    logger.info('restarting to apply new configurations');
    await ctx.reload();

    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'error creating config';

    logger.log('error', 'Config creation error');
    logger.log({ level: 'error', message: err });
  }
};
