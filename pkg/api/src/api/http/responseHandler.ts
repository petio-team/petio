import { StatusCodes } from "http-status-codes";
import { DefaultContext } from "koa";

export default () => async (ctx: DefaultContext, next: () => Promise<any>) => {
  ctx.success = ({ statusCode, data = undefined }: any) => {
    const status = 'success';

    if (!!statusCode && (statusCode < StatusCodes.BAD_REQUEST))
      ctx.status = statusCode;
    else if (!(ctx.status < StatusCodes.BAD_REQUEST))
      ctx.status = StatusCodes.OK;

    ctx.body = { status, data };
  };

  ctx.error = ({ statusCode, code, message = undefined }: any) => {
    const status = 'error';

    if (!!statusCode && (statusCode >= StatusCodes.BAD_REQUEST && statusCode < 600))
      ctx.status = statusCode;
    else if (!(ctx.status >= StatusCodes.INTERNAL_SERVER_ERROR && ctx.status < 600))
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;

    ctx.body = { status, code, message };
  };

  ctx.ok = (params: any = {}) => {
    ctx.success({
      statusCode: StatusCodes.OK,
      data: params,
    });
  };

  ctx.created = (params: any = {}) => {
    ctx.success({
      statusCode: StatusCodes.CREATED,
      data: params,
    });
  };

  ctx.accepted = (params: any = {}) => {
    ctx.success({
      statusCode: StatusCodes.ACCEPTED,
      data: params,
    });
  };

  await next();
};
