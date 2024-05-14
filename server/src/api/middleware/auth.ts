import * as HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import { UserMapper } from '@/resources/user/mapper';
import { UserRepository } from '@/resources/user/repository';

const logger = loggerMain.child({ module: 'middleware.auth' });

function removeCookie(ctx: Context) {
  ctx.cookies.set('petio-jwt', null, { expires: new Date(Date.now() - 2000) });
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
    petioJwt = bearerToken;
  } else {
    throw new Error(`AUTH: No auth token provided - route ${ctx.path}`);
  }

  let userData;
  try {
    const jwtData: any = jwt.verify(petioJwt, ctx.app.keys[0]);
    if (!jwtData) {
      removeCookie(ctx);
      throw new Error(`jwt data was invalid`);
    }
    if (!jwtData.id) {
      removeCookie(ctx);
      throw new Error(`id missing from jwt data`);
    }
    const userRepo = await getFromContainer(UserRepository).findOne({
      _id: jwtData.id,
    });
    if (userRepo.isNone()) {
      throw new Error('no user found');
    }
    const userResult = userRepo.unwrap();
    userData = getFromContainer(UserMapper).toResponse(userResult);
  } catch (error) {
    logger.debug('user not found in db', error);
    throw new Error(`AUTH: User not found in DB - route ${ctx.path}`);
  }

  return userData;
}

export const adminRequired = async (ctx: Context, next: Next) => {
  const { user } = ctx.state;
  if (user && user.admin) {
    await next();
  } else {
    ctx.status = HttpStatus.StatusCodes.FORBIDDEN;
    logger.warn(`AUTH: User not admin`);
  }
};