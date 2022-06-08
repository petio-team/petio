import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import * as z from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { HasConfig, WriteConfig } from '@/config/config';
import { config } from '@/config/schema';
import logger from '@/loaders/logger';
import setupReady from '@/util/setupReady';

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

const getConfig = async (ctx: Context) => {
  const configStatus = await HasConfig();
  let ready = false;
  if (configStatus !== false) {
    try {
      let setupCheck = await setupReady();
      if (setupCheck.ready) {
        ready = true;
      }
      if (setupCheck.error) {
        ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
        ctx.body = {
          error: 'An error has occured',
        };
        return;
      }
    } catch {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
      ctx.body = {
        error: 'An error has occured',
      };
      return;
    }
  }
  ctx.body = {
    config: configStatus,
    login_type: config.get('auth.type'),
    ready: ready,
  };
};

const updateConfig = async (ctx: Context) => {
  const {
    plexToken,
    base_path,
    login_type,
    plexPopular,
    telegram_bot_token,
    telegram_chat_id,
    telegram_send_silently,
    discord_webhook,
  } = ctx.request.body;

  if (plexToken) {
    config.set('plex.token', plexToken);
  }
  if (base_path) {
    config.set('petio.subpath', base_path);
  }
  if (login_type) {
    config.set('auth.type', login_type);
  }
  if (plexPopular) {
    config.set('general.popular', plexPopular);
  }
  if (telegram_bot_token) {
    config.set('notifications.telegram.token', telegram_bot_token);
  }
  if (telegram_chat_id) {
    config.set('notifications.telegram.id', telegram_chat_id);
  }
  if (telegram_send_silently) {
    config.set('notifications.telegram.silent', telegram_send_silently);
  }
  if (discord_webhook) {
    config.set('notifications.discord.url', discord_webhook);
  }

  try {
    await WriteConfig();
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
    ctx.status = StatusCodes.OK;
    ctx.body = {
      base_path: config.get('petio.subpath'),
      login_type: config.get('auth.type'),
      plexPopular: config.get('general.popular'),
      discord_webhook: config.get('notifications.discord.url'),
      telegram_bot_token: config.get('notifications.telegram.token'),
      telegram_chat_id: config.get('notifications.telegram.id'),
      telegram_send_silently: config.get('notifications.telegram.silent'),
    };
  } catch (err) {
    logger.log('error', 'ROUTE: Config error');
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'config not found';
  }
};
