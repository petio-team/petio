import { StatusCodes } from 'http-status-codes';
import { Context, Next } from 'koa';

export const errorHandler = async (ctx: Context, next: Next) => {
  // call our next middleware
  try {
    await next();
  } catch (error) {
    ctx.status =
      error.statusCode || error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    error.status = ctx.status;
    ctx.body = { error };
    ctx.app.emit('error', error, ctx);
  }
};
