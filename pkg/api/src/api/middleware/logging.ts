import logger from "@/loaders/logger";
import { Context, Next } from "koa";
import PinoHttp from "pino-http";

const httpLogger = PinoHttp({
  logger: logger.core,
  quietReqLogger: true,
  transport: {
    target: 'pino-http-print',
    options: {
      destination: 1,
      all: false,
      translateTime: true
    }
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url
    })
  },
  wrapSerializers: true,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
});

export default function () {
  return async function cb(ctx: Context, next: Next) {
    httpLogger(ctx.req, ctx.res);
    return next();
  };
}
