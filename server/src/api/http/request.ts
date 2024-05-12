import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

interface IResponse {
  status: 'success' | 'error';
  error?: {
    message: string;
    extra?: any;
  };
  data?: any;
}

const MakeResponse = (data?: any, error?: string, extra?: any): IResponse => {
  if (error) {
    return {
      status: 'error',
      error: {
        message: error,
        extra,
      },
    };
  }
  return {
    status: 'success',
    data,
  };
};

export const StatusNotFound = (ctx: Context, error: string, extra?: any) => {
  ctx.status = StatusCodes.NOT_FOUND;
  ctx.body = MakeResponse(undefined, error, extra);
};

export const StatusInternalServerError = (
  ctx: Context,
  error: string,
  extra?: any,
) => {
  ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
  ctx.body = MakeResponse(undefined, error, extra);
};

export const StatusUnauthorized = (
  ctx: Context,
  error: string,
  extra?: any,
) => {
  ctx.status = StatusCodes.UNAUTHORIZED;
  ctx.body = MakeResponse(undefined, error, extra);
};

export const StatusNotAcceptable = (
  ctx: Context,
  error: string,
  extra?: any,
) => {
  ctx.status = StatusCodes.NOT_ACCEPTABLE;
  ctx.body = MakeResponse(undefined, error, extra);
};

export const StatusBadRequest = (ctx: Context, error: string, extra?: any) => {
  ctx.status = StatusCodes.BAD_REQUEST;
  ctx.body = MakeResponse(undefined, error, extra);
};

export const StatusOk = (ctx: Context, data: any) => {
  ctx.status = StatusCodes.OK;
  ctx.body = MakeResponse(data);
};
