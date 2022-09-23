import { StatusCodes } from "http-status-codes";
import { Context, Next } from 'koa';
import { ZodError, ZodSchema } from 'zod';

type ErrorListItem = {
  type: 'Query' | 'Params' | 'Body';
  errors: ZodError<any>;
};

export function sendErrors(
  errors: { type: any; errors: any }[],
  ctx: Context,
): void {
  const errorsList = errors.map((e) => {
    const errStr = JSON.parse(e.errors).map(
      (o) => `code: ${o.code}, expected: ${o.expected}, received: ${o.received}, path: ${JSON.stringify(o.path)}, message: ${o.message}`
    );
    return `[${e.type}] ${errStr}`
  });
  ctx.error({
    statusCode: StatusCodes.BAD_REQUEST,
    code: 'VALIDATION_ERROR',
    message: errorsList.join(" -- "),
  });
}

export function validateRequest({
  params,
  query,
  body,
}: {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
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
    return undefined;
  };
}
