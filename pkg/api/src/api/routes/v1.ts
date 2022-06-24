import Router from '@koa/router';
import Koa from 'koa';

import session from '@/api/middleware/session';

import mediaserver from './v1/mediaserver';

const route = new Router({ prefix: '/api/v1' });

export default (app: Koa) => {
  // endpoints
  mediaserver(route);

  // tell app about our routes and methods
  app.use(route.routes()).use(route.allowedMethods());
};
