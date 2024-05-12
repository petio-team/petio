import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

const handleHealth = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = '.';
};

const route = new Router({ prefix: '/health' });
export default (app: Router) => {
  route.get('/', handleHealth);

  app.use(route.routes());
};
