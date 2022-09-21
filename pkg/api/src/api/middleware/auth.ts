import * as HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

import { config } from '@/config/schema';
import logger from '@/loaders/logger';
import { UserModel } from '@/models/user';

export async function authenticate(ctx: Context) {
  const { authorization: header } = ctx.request.headers;
  const cookie = ctx.cookies.get('petio_jwt');

  let petioJwt;
  if (ctx.request.body.authToken) {
    petioJwt = ctx.request.body.authToken;
  } else if (cookie) {
    petioJwt = cookie;
  } else if (header && /^Bearer (.*)$/.test(header)) {
    const match: any = /^Bearer (.*)$/.exec(header);
    petioJwt = match[1];
  } else {
    throw new Error(`AUTH: No auth token provided - route ${ctx.path}`);
  }

  let userData;
  try {
    const jwtData = jwt.verify(petioJwt, config.get('plex.token'));

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
