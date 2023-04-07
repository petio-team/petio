import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import Discord from '@/services/notifications/discord';
import Telegram from '@/services/notifications/telegram';

const testDiscordConnection = async (ctx: Context) => {
  const test = await new Discord().test();

  ctx.status = StatusCodes.OK;
  ctx.body = { result: test.result, error: test.error };
};

const testTelegramConnection = async (ctx: Context) => {
  const test = await new Telegram().test();

  ctx.status = StatusCodes.OK;
  ctx.body = { result: test.result, error: test.error };
};

const route = new Router({ prefix: '/hooks' });
export default (app: Router) => {
  route.get('/discord/test', testDiscordConnection);
  route.get('/telegram/test', testTelegramConnection);

  app.use(route.routes());
};