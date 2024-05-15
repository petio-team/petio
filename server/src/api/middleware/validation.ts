import { StatusCodes } from 'http-status-codes';
import { Context, Next } from 'koa';
import { ZodError, ZodSchema } from 'zod';

/**
 * Represents an item containing validation errors for a specific type.
 */
type ErrorListItem = {
  type: 'Query' | 'Params' | 'Body';
  errors: ZodError<any>;
};

/**
 * Sends validation errors to the client.
 *
 * @param errors - An array of error objects containing information about the validation errors.
 * @param ctx - The context object representing the current request/response context.
 * @returns void
 */
export function sendErrors(
  errors: { type: any; errors: any }[],
  ctx: Context,
): void {
  const errorsList = errors.map((e) => {
    const errStr = JSON.parse(e.errors).map(
      (o: {
        code: any;
        expected: any;
        received: any;
        path: any;
        message: any;
      }) =>
        `code: ${o.code}, expected: ${o.expected}, received: ${
          o.received
        }, path: ${JSON.stringify(o.path)}, message: ${o.message} `,
    );
    return `[${e.type}] ${errStr}`;
  });
  ctx.error({
    statusCode: StatusCodes.BAD_REQUEST,
    code: 'VALIDATION_ERROR',
    message: errorsList.join(' -- '),
  });
}

/**
 * Validates the request parameters, query, and body against the provided schemas.
 * If any validation errors occur, it sends the errors as a response and stops the request flow.
 * Otherwise, it proceeds to the next middleware.
 *
 * @param {Object} options - The validation options.
 * @param {ZodSchema} options.params - The schema for validating the request parameters.
 * @param {ZodSchema} options.query - The schema for validating the request query.
 * @param {ZodSchema} options.body - The schema for validating the request body.
 * @returns {Function} - The middleware function.
 */
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
