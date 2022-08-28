import Cors from '@koa/cors';
import Koa from 'koa';

import { IsDevelopment, corsDomains } from '@/config/env';

export const cors = () => {
  // Enable cors
  const whitelist = corsDomains.split(',').map((domain) => domain.trim());
  if (IsDevelopment()) {
    // add local react dev
    whitelist.push('http://localhost:3000');
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
