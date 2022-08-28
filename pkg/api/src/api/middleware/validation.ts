import { StatusCodes } from 'http-status-codes';
import { Context, Next } from 'koa';
import { ZodError } from 'zod';

import { StatusBadRequest } from '../web/request';

type ErrorListItem = {
  type: 'Query' | 'Params' | 'Body';
  errors: ZodError<any>;
};

export function sendErrors(
  errors: { type: any; errors: any }[],
  ctx: Context,
): void {
  const err = errors.map((error: { type: any; errors: any }) => ({
    type: error.type,
    errors: error.errors,
  }));
  StatusBadRequest(ctx, 'failed to validate request', err);
}

export function validateRequest({
  params,
  query,
  body,
}: {
  params?: any;
  query?: any;
  body?: any;
}): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    const errors: Array<ErrorListItem> = [];
    if (params) {
      const parsed = await params.safeParseAsync(ctx.params);
      if (!parsed.success) {
        errors.push({ type: 'Params', errors: parsed.error });
      }
    }
    if (query) {
      const parsed = await query.safeParseAsync(ctx.query);
      if (!parsed.success) {
        errors.push({ type: 'Query', errors: parsed.error });
      }
    }
    if (body) {
      const parsed = await body.safeParseAsync(ctx.request.body);
      if (!parsed.success) {
        errors.push({ type: 'Body', errors: parsed.error });
      }
    }
    if (errors.length > 0) {
      return sendErrors(errors, ctx);
    }
    await next();
  };
}
