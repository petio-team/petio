import * as HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

import { config } from '@/config/schema';
import logger from '@/loaders/logger';
import { UserModel } from '@/models/user';

function removeCookie(ctx: Context) {
  logger.debug("removing invalid cookie")
  ctx.cookies.set("petio-jwt", null, { expires: new Date(Date.now() - 2000) });
}

export async function authenticate(ctx: Context) {
  const cookie = ctx.cookies.get('petio_jwt');
  const bearerToken = ctx.request.header.authorization;

  let petioJwt;
  if (ctx.request.body.authToken) {
    petioJwt = ctx.request.body.authToken;
  } else if (cookie) {
    petioJwt = cookie;
  } else if (bearerToken) {
    petioJwt = bearerToken
  } else {
    throw new Error(`AUTH: No auth token provided - route ${ctx.path}`);
  }

  let userData;
  try {
    const jwtData: any = jwt.verify(petioJwt, config.get('plex.token'));
    if (!jwtData) {
      removeCookie(ctx);
      throw new Error(`jwt data was invalid`);
    }
    if (!jwtData.id) {
      removeCookie(ctx);
      throw new Error(`id missing from jwt data`);
    }

    const resp = await UserModel.findOne({ _id: (jwtData as any).id }).exec();
    if (!resp) {
      throw new Error('no user found');
    }
    userData = resp.toJSON();
  } catch (error) {
    logger.error(error);
    throw new Error(`AUTH: User not found in DB - route ${ctx.path}`);
  }

  return userData;
}

export const adminRequired = async (ctx: Context, next: Next) => {
  const {user} = ctx.state;
  if (user && user.admin) {
    await next();
  } else {
    ctx.status = HttpStatus.StatusCodes.FORBIDDEN;
    logger.warn(`AUTH: User not admin`, { label: 'middleware.auth' });
  }
};
