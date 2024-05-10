import Router from '@koa/router';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import request from 'xhr-request';
import xmlParser from 'xml-js';

import { authenticate } from '@/api/middleware/auth';
import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import { UserEntity } from '@/resources/user/entity';
import { UserMapper } from '@/resources/user/mapper';
import { UserRepository } from '@/resources/user/repository';
import { UserRole } from '@/resources/user/types';
import { SettingsService } from '@/services/settings/settings';

const logger = loggerMain.child({ module: 'routes.login' });

function success(ctx: Context, user: UserEntity, isAdmin = false): void {
  const token = jwt.sign({ id: user.id, admin: isAdmin }, ctx.app.keys[0]);

  ctx.cookies.set('petio_jwt', token, {
    httpOnly: false,
    signed: true,
    secure: false,
    expires: new Date(Date.now() + 2629800000),
  });

  ctx.status = StatusCodes.OK;
  ctx.body = {
    loggedIn: true,
    user,
    token,
    admin: isAdmin,
  };
}

async function plexOauth(token: string): Promise<any> {
  try {
    const plex = await axios.get(
      `https://plex.tv/users/account?X-Plex-Token=${token}`,
    );
    const data = JSON.parse(xmlParser.xml2json(plex.data, { compact: false }));
    const user = data.elements[0].attributes;
    return user.id;
  } catch (err) {
    logger.error(`failed to get plex oauth`, err);
  }
  return undefined;
}

async function saveRequestIp(user: UserEntity, request_ip: string) {
  try {
    await getFromContainer(UserRepository).updateMany(
      { id: user.id },
      { lastIp: request_ip, lastLogin: new Date() },
    );
  } catch (err) {
    logger.error('LOGIN: Update IP failed', err);
  }
}

const attemptPlexAuth = async (ctx: Context) => {
  const requestIp = ctx.request.ip;
  const { token } = ctx.request.body;
  try {
    const plexId = await plexOauth(token);
    const userRepo = await getFromContainer(UserRepository).findOne({ plexId });
    if (userRepo.isNone()) {
      ctx.error({
        statusCode: StatusCodes.FORBIDDEN,
        code: 'USER_NOT_FOUND',
        message: 'user not found',
      });
      return;
    }
    const dbUser = userRepo.unwrap();
    if (dbUser.disabled) {
      ctx.error({
        statusCode: StatusCodes.FORBIDDEN,
        code: 'USER_DISABLED',
        message: 'user is disabled',
      });
      return;
    }

    const isAdmin = dbUser.role === UserRole.ADMIN;
    success(ctx, dbUser, isAdmin);
    saveRequestIp(dbUser, requestIp);
  } catch (err) {
    logger.debug(err, `failed to login user via plex`);
    ctx.error({
      statusCode: StatusCodes.FORBIDDEN,
      code: 'PLEX_AUTH_FAILED',
      message: 'failed to login user via plex',
    });
  }
};

function plexAuth(username: string, password: string) {
  logger.info(`LOGIN: Using Plex Auth for ${username}`);
  return new Promise((resolve, reject) => {
    request(
      'https://plex.tv/users/sign_in.json',
      {
        method: 'POST',
        json: true,
        headers: {
          'X-Plex-Product': 'Petio',
          'X-Plex-Platform-Version': '1.0',
          'X-Plex-Device-Name': 'Petio API',
          'X-Plex-Version': '1.0',
          'X-Plex-Client-Identifier': `petio_${''}`,
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
      (err: any, data: any) => {
        if (err) {
          logger.warn(`LOGIN: Plex auth failed for ${username}`);
          reject();
        }
        if (!data) {
          logger.warn(`LOGIN: Plex auth error ${username}`);
          reject(new Error('LOGIN: Failed Plex Auth'));
        } else if (data.error) {
          logger.warn(`LOGIN: Plex auth error ${username}`);
          reject(new Error('LOGIN: Failed Plex Auth'));
        } else {
          logger.info(`LOGIN: Plex auth passed ${username}`);
          resolve(data);
        }
      },
    );
  });
}

const attemptAuth = async (ctx: Context) => {
  const requestIp = ctx.request.ip;
  const {
    user: { username, password },
  } = ctx.request.body || { user: {} };

  logger.debug(`LOGIN: New login attempted from ip ${requestIp}`);

  // check for existing jwt (skip if performing admin auth)
  if (!password) {
    try {
      const user = await authenticate(ctx);
      if (!user) {
        ctx.error({
          statusCode: StatusCodes.UNAUTHORIZED,
          code: '',
          message: 'invalid user',
        });
        return;
      }

      success(ctx, user, user.owner);
      logger.debug(`LOGIN: Request User: ${user.username}`);
      return;
    } catch (err) {
      // if existing jwt failed, continue onto normal login flow
      logger.debug(err, `LOGIN: No JWT: ${requestIp}`);
      return;
    }
  }

  logger.debug(`LOGIN: Request User: ${username}`);

  try {
    // Find user in db
    const dbRepo = await getFromContainer(UserRepository).findOne({
      $or: [{ username }, { email: username }],
    });
    if (dbRepo.isNone()) {
      ctx.error({
        statusCode: StatusCodes.FORBIDDEN,
        code: 'USER_NOT_FOUND',
        message: 'user not found',
      });
      logger.debug(`LOGIN: User not found ${username} - ${requestIp}`);
      return;
    }
    const dbUser = dbRepo.unwrap();
    if (dbUser.disabled) {
      ctx.error({
        statusCode: StatusCodes.FORBIDDEN,
        code: 'USER_DISABLED',
        message: 'user is disabled',
      });
      return;
    }

    const isAdmin = dbUser.role === UserRole.ADMIN;
    const { authType } = await getFromContainer(SettingsService).getSettings();

    if (authType === 1 || password) {
      if (dbUser.password) {
        if (!bcrypt.compareSync(password, dbUser.password)) {
          ctx.error({
            statusCode: StatusCodes.FORBIDDEN,
            code: 'INVALID_CREDENTIALS',
            message: 'users credentials are invalid',
          });
          return;
        }
      } else {
        // throws on invalid credentials
        await plexAuth(username, password);
      }
      success(ctx, getFromContainer(UserMapper).toResponse(dbUser), isAdmin);
    } else {
      // passwordless login, no check required. But we downgrade admin perms
      success(ctx, getFromContainer(UserMapper).toResponse(dbUser), false);
    }
    saveRequestIp(dbUser, requestIp);
  } catch (err) {
    logger.debug(`failed to authenticate user`, err);
    ctx.error({
      statusCode: StatusCodes.FORBIDDEN,
      code: 'AUTH_FAILED',
      message: 'failed to authenticate user',
    });
  }
};

const route = new Router({ prefix: '/login' });
export default (app: Router) => {
  route.post('/', attemptAuth);
  route.post('/plex_login', attemptPlexAuth);

  app.use(route.routes());
};
