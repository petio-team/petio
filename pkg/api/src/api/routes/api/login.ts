import Router from '@koa/router';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import request from 'xhr-request';
import xmlParser from 'xml-js';

import { authenticate } from '@/api/middleware/auth';
import { config } from '@/config/index';
import logger from '@/loaders/logger';
import { GetUserByPlexID, UserModel, UserRole } from '@/models/user';

function success(ctx, user, isAdmin = false) {
  const token = jwt.sign(
    { id: user.id, admin: isAdmin },
    config.get('plex.token'),
  );

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

async function plexOauth(token): Promise<any> {
  const plex = await axios.get(
    `https://plex.tv/users/account?X-Plex-Token=${token}`,
  );
  try {
    const data = JSON.parse(xmlParser.xml2json(plex.data, { compact: false }));
    const user = data.elements[0].attributes;
    return user.id;
  } catch (err) {
    logger.error(err, { label: 'routes.login' });
  }

  return undefined;
}

async function saveRequestIp(user, request_ip) {
  try {
    await UserModel.updateOne(
      // eslint-disable-next-line no-underscore-dangle
      { _id: user._id },
      {
        $set: {
          lastIp: request_ip,
          lastLogin: new Date(),
        },
      },
    ).exec();
  } catch (err) {
    logger.error('LOGIN: Update IP failed', { label: 'routes.login' });
    logger.error(err, { label: 'routes.login' });
  }
}

const attemptPlexAuth = async (ctx: Context) => {
  const requestIp = ctx.request.ip;
  const {token} = ctx.request.body;
  try {
    const userId = await plexOauth(token);
    const dbUser = await GetUserByPlexID(userId);

    if (!dbUser) {
      ctx.status = StatusCodes.UNAUTHORIZED;
      ctx.body = { error: 'user not found' };
      return;
    }

    if (dbUser.disabled) {
      ctx.status = StatusCodes.UNAUTHORIZED;
      ctx.body = { error: 'user is disabled' };
      return;
    }

    const isAdmin = dbUser.role === UserRole.Admin;
    success(ctx, dbUser, isAdmin);
    saveRequestIp(dbUser, requestIp);
  } catch (err) {
    logger.error(err, { label: 'routes.login' });

    ctx.status = StatusCodes.UNAUTHORIZED;
    ctx.body = { loggedIn: false, user: null, admin: false, token: null };
  }
};

function plexAuth(username, password) {
  logger.info(`LOGIN: Using Plex Auth for ${username}`, {
    label: 'routes.login',
  });
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
          'X-Plex-Client-Identifier': config.get('plex.client'),
          Authorization:
            `Basic ${
            Buffer.from(`${username}:${password}`).toString('base64')}`,
        },
      },
      (err, data) => {
        if (err) {
          logger.warn(`LOGIN: Plex auth failed for ${username}`, {
            label: 'routes.login',
          });
          reject();
        }
        if (!data) {
          logger.warn(`LOGIN: Plex auth error ${username}`, {
            label: 'routes.login',
          });
          reject(new Error('LOGIN: Failed Plex Auth'));
        } else if (data.error) {
          logger.warn(`LOGIN: Plex auth error ${username}`, {
            label: 'routes.login',
          });
          reject(new Error('LOGIN: Failed Plex Auth'));
        } else {
          logger.info(`LOGIN: Plex auth passed ${username}`, {
            label: 'routes.login',
          });
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

  if (!config.get('auth.type')) {
    config.set('auth.type', 1);
  }

  logger.verbose(`LOGIN: New login attempted`, { label: 'routes.login' });
  logger.verbose(`LOGIN: Request IP: ${requestIp}`, {
    label: 'routes.login',
  });

  // check for existing jwt (skip if performing admin auth)
  if (!password)
    try {
      const user = await authenticate(ctx);
      if (!user) {
        ctx.status = StatusCodes.UNAUTHORIZED;
        ctx.body = 'invalid user';
        return;
      }

      success(ctx, user, user.owner);
      logger.verbose(`LOGIN: Request User: ${user.username}`, {
        label: 'routes.login',
      });
      return;
    } catch (e) {
      // if existing jwt failed, continue onto normal login flow
      logger.verbose(`LOGIN: No JWT: ${requestIp}`, {
        label: 'routes.login',
      });
      logger.error(e);
    }

  logger.verbose(`LOGIN: Request User: ${username}`, {
    label: 'routes.login',
  });

  try {
    // Find user in db
    const dbUser = await UserModel.findOne({
      $or: [{ username }, { email: username }],
    }).exec();

    if (!dbUser) {
      ctx.status = StatusCodes.UNAUTHORIZED;
      ctx.body = {
        error: 'User not found',
      };
      logger.warn(`LOGIN: User not found ${username} - ${requestIp}`, {
        label: 'routes.login',
      });
      return;
    }

    if (dbUser.disabled) {
      ctx.status = StatusCodes.UNAUTHORIZED;
      ctx.body = {
        error: 'User is disabled',
      };
      return;
    }

    const isAdmin = dbUser.role === UserRole.Admin;

    if (config.get('auth.type') === 1 || password) {
      if (dbUser.password) {
        if (!bcrypt.compareSync(password, dbUser.password)) {
          ctx.status = StatusCodes.UNAUTHORIZED;
          ctx.body = { error: 'password is incorrect' };
          return;
        }
      } else {
        // throws on invalid credentials
        await plexAuth(username, password);
      }
      success(ctx, dbUser.toJSON(), isAdmin);
    } else {
      // passwordless login, no check required. But we downgrade admin perms
      success(ctx, dbUser.toJSON(), false);
    }
    saveRequestIp(dbUser, requestIp);
  } catch (err) {
    logger.error(err, { label: 'routes.login' });

    ctx.status = StatusCodes.UNAUTHORIZED;
    ctx.body = { loggedIn: false, user: null, admin: false, token: null };
  }
};


const route = new Router({ prefix: '/login' });
export default (app: Router) => {
  route.post('/', attemptAuth);
  route.post('/plex_login', attemptPlexAuth);

  app.use(route.routes());
};