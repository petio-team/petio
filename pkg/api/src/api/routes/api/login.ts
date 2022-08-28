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
import { UserModel, UserRole } from '@/models/user';

const route = new Router({ prefix: '/login' });

export default (app: Router) => {
  route.post('/', attemptAuth);
  route.post('/plex_login', attemptPlexAuth);

  app.use(route.routes());
};

const attemptAuth = async (ctx: Context) => {
  const request_ip = ctx.request.ip;
  const {
    user: { username, password },
  } = ctx.request.body || { user: {} };

  if (!config.get('auth.type')) {
    config.set('auth.type', 1);
  }

  logger.verbose(`LOGIN: New login attempted`, { label: 'routes.login' });
  logger.verbose(`LOGIN: Request IP: ${request_ip}`, {
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
      logger.verbose(`LOGIN: No JWT: ${request_ip}`, {
        label: 'routes.login',
      });
      logger.error(e);

      ctx.status = StatusCodes.UNAUTHORIZED;
      ctx.body = {};
      return;
    }

  logger.verbose(`LOGIN: Request User: ${username}`, {
    label: 'routes.login',
  });

  try {
    // Find user in db
    let dbUser = await UserModel.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!dbUser) {
      ctx.status = StatusCodes.UNAUTHORIZED;
      ctx.body = {
        error: 'User not found',
      };
      logger.warn(`LOGIN: User not found ${username} - ${request_ip}`, {
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

    let isAdmin = dbUser.role === UserRole.Admin;

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
    saveRequestIp(dbUser, request_ip);
  } catch (err) {
    logger.error(err, { label: 'routes.login' });

    ctx.status = StatusCodes.UNAUTHORIZED;
    ctx.body = { loggedIn: false, user: null, admin: false, token: null };
  }
};

const attemptPlexAuth = async (ctx: Context) => {
  const request_ip = ctx.request.ip;

  const token = ctx.request.body.token;
  try {
    let userId = await plexOauth(token);
    let dbUser = await UserModel.findOne({ plexId: userId });
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

    let isAdmin = dbUser.role === UserRole.Admin;
    success(ctx, dbUser.toJSON(), isAdmin);
    saveRequestIp(dbUser, request_ip);
  } catch (err) {
    logger.error(err, { label: 'routes.login' });

    ctx.status = StatusCodes.UNAUTHORIZED;
    ctx.body = { loggedIn: false, user: null, admin: false, token: null };
  }
};

function success(ctx, user, isAdmin = false) {
  const token = jwt.sign({ ...user, admin: isAdmin }, config.get('plex.token'));

  ctx.cookies.set('petio_jwt', token, {
    maxAge: 2419200000,
    httpOnly: false,
  });

  ctx.status = StatusCodes.OK;
  ctx.body = {
    loggedIn: true,
    user,
    token,
    admin: isAdmin,
  };
}

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
            'Basic ' +
            Buffer.from(`${username}:${password}`).toString('base64'),
        },
      },
      function (err, data) {
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
          reject('LOGIN: Failed Plex Auth');
        } else if (data.error) {
          logger.warn(`LOGIN: Plex auth error ${username}`, {
            label: 'routes.login',
          });
          reject('LOGIN: Failed Plex Auth');
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

async function plexOauth(token) {
  let plex = await axios.get(
    `https://plex.tv/users/account?X-Plex-Token=${token}`,
  );
  try {
    let data = JSON.parse(xmlParser.xml2json(plex.data, { compact: false }));
    let user = data.elements[0].attributes;
    return user.id;
  } catch (err) {
    logger.error(err, { label: 'routes.login' });
    throw 'Plex authentication failed';
  }
}

async function saveRequestIp(user, request_ip) {
  try {
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          lastIp: request_ip,
          lastLogin: new Date(),
        },
      },
    );
  } catch (err) {
    logger.error('LOGIN: Update IP failed', { label: 'routes.login' });
    logger.error(err, { label: 'routes.login' });
  }
}
