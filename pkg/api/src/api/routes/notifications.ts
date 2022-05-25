import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import Discord from '@/notifications/discord';
import Telegram from '@/notifications/telegram';

const route = new Router({ prefix: '/hooks' });

export default (app: Router) => {
  route.get('/discord/test', testDiscordConnection);
  route.get('/telegram/test', testTelegramConnection);

  app.use(route.routes());
};

const testDiscordConnection = async (ctx: Context) => {
  let test = await new Discord().test();

  ctx.status = StatusCodes.OK;
  ctx.body = { result: test.result, error: test.error };
};

const testTelegramConnection = async (ctx: Context) => {
  let test = await new Telegram().test();

  ctx.status = StatusCodes.OK;
  ctx.body = { result: test.result, error: test.error };
};
