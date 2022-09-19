import { StatusCodes } from 'http-status-codes';
import { Context, Next } from 'koa';

import { HasConfig } from '@/config/index';

export default async (ctx: Context, next: Next) => {
  const exists = await HasConfig();
  if (!exists) {
    const {path} = ctx;
    if (path.startsWith('/api')) {
      if (
        path !== '/' &&
        !path.includes('/api/setup') &&
        path !== '/api/config'
      ) {
        ctx.status = StatusCodes.UNAUTHORIZED;
        ctx.body = 'you need to complete setup to access this url';
        return;
      }
    }
  }
  await next();
};
