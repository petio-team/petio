import Cors from '@koa/cors';
import Koa from 'koa';

import httpConfig from "@/config/env/http";
import envConfig from "@/config/env/node";

export default () => {
  // Enable cors
  const whitelist = httpConfig.corsDomains;
  if (envConfig.isDevelopment) {
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
      }
        return 'http://localhost:7777';
    },
    credentials: true,
  };

  return Cors(corsOptions);
};
