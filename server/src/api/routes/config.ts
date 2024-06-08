import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import * as z from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { HTTP_BASE_PATH } from '@/infrastructure/config/env';
import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { SettingsService } from '@/services/settings/settings-service';

const getConfig = async (ctx: Context) => {
  try {
    const settings = await getFromContainer(SettingsService).getSettings();
    ctx.body = {
      config: settings.initialSetup || false,
      login_type: settings.authType || 1,
      ready: settings.initialSetup || false,
    };
  } catch (err) {
    logger.error(`failed to get config`, err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'An error has occured',
    };
  }
};

const updateConfig = async (ctx: Context) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    login_type,
    plexPopular,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    telegram_bot_token,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    telegram_chat_id,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    telegram_send_silently,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    discord_webhook,
  } = ctx.request.body;

  const settings = getFromContainer(SettingsService);
  try {
    const currentSettings = await settings.getSettings();
    if (login_type || plexPopular) {
      await settings.updateSettings({
        authType: login_type ?? currentSettings.authType,
        popularContent: plexPopular ?? currentSettings.popularContent,
      });
    }
  } catch (err) {
    logger.error(err);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'Config Not Found';
    return;
  }
  ctx.status = StatusCodes.OK;
  ctx.body = 'config updated';
};

const getCurrentConfig = async (ctx: Context) => {
  try {
    const settings = await getFromContainer(SettingsService).getSettings();

    ctx.status = StatusCodes.OK;
    ctx.body = {
      base_path: HTTP_BASE_PATH,
      login_type: settings.authType,
      plexPopular: settings.popularContent,
      discord_webhook: '',
      telegram_bot_token: '',
      telegram_chat_id: '',
      telegram_send_silently: false,
    };
  } catch (err) {
    logger.error('ROUTE: Config error', err);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'config not found';
  }
};

const route = new Router({ prefix: '/config' });
export default (app: Router) => {
  route.get('/', getConfig);
  route.post(
    '/update',
    validateRequest({
      body: z.object({
        plexToken: z.string().optional(),
        base_path: z.string().optional(),
        login_type: z.number().optional(),
        plexPopular: z.boolean().optional(),
        telegram_chat_id: z.string().optional(),
        telegram_bot_token: z.string().optional(),
        telegram_send_silent: z.boolean().optional(),
        discord_webhook: z.string().optional(),
      }),
    }),
    updateConfig,
  );
  route.get('/current', getCurrentConfig);

  app.use(route.routes());
};
