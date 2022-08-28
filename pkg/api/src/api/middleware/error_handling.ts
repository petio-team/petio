import { StatusCodes } from 'http-status-codes';
import { Context, Next } from 'koa';

import { StatusInternalServerError } from '../web/request';

export const errorHandler = async (ctx: Context, next: Next) => {
  // call our next middleware
  try {
    await next();
  } catch (error) {
    StatusInternalServerError(ctx, error.message);
    ctx.app.emit('error', error, ctx);
  }
};
