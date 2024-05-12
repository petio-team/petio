/**
 * Represents a serialized exception.
 */
export interface SerialisedException  {
  message: string;
  code: string;
  correlationId?: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
};

/**
 * Base class for custom exceptions.
 *
 * @abstract
 * @class ExceptionBase
 * @extends {Error}
 */
export abstract class ExceptionBase extends Error {
  //
  abstract code: string;

  //
  constructor(
    readonly message: string,
    readonly cause?: Error,
    readonly metadata?: Record<string, unknown>,
    readonly correlationId?: string,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  //
  static isExceptionError(err: unknown): err is ExceptionBase {
    return err instanceof ExceptionBase;
  }

  //
  toJSON(): SerialisedException {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      correlationId: this.correlationId,
      cause: JSON.stringify(this.cause),
      metadata: this.metadata,
    };
  }
}
