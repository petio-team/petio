import Router from "@koa/router";
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

const route = new Router({ prefix: '/health' });

export default (app: Router) => {
  route.get('/', handleHealth);

  app.use(route.routes());
};

const handleHealth = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = '.';
};
