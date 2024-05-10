import Cors from '@koa/cors';
import Koa from 'koa';

import { HTTP_CORS_DOMAINS } from '@/infrastructure/config/env';

export default () => {
  const corsOptions = {
    origin: async (ctx: Koa.Context): Promise<string> => {
      if (
        ctx.request.header.origin &&
        HTTP_CORS_DOMAINS.indexOf(ctx.request.header.origin) !== -1
      ) {
        return ctx.request.header.origin;
      }
      return 'http://localhost:7777';
    },
    credentials: true,
  };

  return Cors(corsOptions);
};
