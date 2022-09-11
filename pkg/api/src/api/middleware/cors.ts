import Cors from '@koa/cors';
import Koa from 'koa';

import env from '@/config/env';

export const cors = () => {
  // Enable cors
  const whitelist = env.app.http.cors.domains
    .split(',')
    .map((domain) => domain.trim());
  if (env.environment === 'development') {
    // add local react dev
    whitelist.push('http://localhost:3001'); // frontend
    whitelist.push('http://localhost:3002'); // admin
  }

  const corsOptions = {
    origin: async (ctx: Koa.Context): Promise<string> => {
      if (
        ctx.request.header.origin &&
        whitelist.indexOf(ctx.request.header.origin) !== -1
      ) {
        return ctx.request.header.origin;
      } else {
        return 'http://localhost:7777';
      }
    },
    credentials: true,
  };

  return Cors(corsOptions);
};
