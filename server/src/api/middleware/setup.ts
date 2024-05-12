import { StatusCodes } from 'http-status-codes';
import { Context, Next } from 'koa';

import { getFromContainer } from '@/infrastructure/container/container';
import { SettingsService } from '@/services/settings/settings';

export default async (ctx: Context, next: Next) => {
  const settings = await getFromContainer(SettingsService).getSettings();
  if (!settings.initialSetup) {
    const { path } = ctx;
    if (path.startsWith('/api')) {
      if (
        path !== '/' &&
        !path.includes('/api/setup') &&
        path !== '/api/config'
      ) {
        ctx.status = StatusCodes.LOCKED;
        ctx.body = 'you need to complete setup to access this url';
        return;
      }
    }
  }
  await next();
};
