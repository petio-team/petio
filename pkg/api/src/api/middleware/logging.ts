import { Context, Next } from 'koa';
import PinoHttp from 'pino-http';

import logger from '@/infra/logger/logger';

const httpLogger = PinoHttp({
  logger: logger.core(),
  quietReqLogger: true,
  transport: {
    target: 'pino-http-print',
    options: {
      destination: 1,
      all: false,
      translateTime: true,
    },
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
  },
  wrapSerializers: true,
  customLogLevel(req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    }
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'debug';
  },
});

export default function handler() {
  return async function cb(ctx: Context, next: Next) {
    httpLogger(ctx.req, ctx.res);
    return next();
  };
}
