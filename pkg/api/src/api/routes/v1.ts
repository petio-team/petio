import Router from '@koa/router';
import Koa from 'koa';

import mediaserver from './v1/mediaserver';

const route = new Router({ prefix: '/api/v1' });

export default (app: Koa) => {
  // endpoints
  mediaserver(route);

  app.use(route.routes()).use(route.allowedMethods());
};
