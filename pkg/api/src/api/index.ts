import Koa from 'koa';

import setupMiddleware from '@/api/middleware/setup';
import api from '@/api/routes/api';
import web from '@/api/routes/web';

import v1 from './routes/v1';

const app = new Koa();

export default (subpath: string): Koa => {
  // make sure setup is complete before allowing access to non setup routes
  app.use(setupMiddleware);

  // web/frontend/react
  web(app);

  // setup old api
  api(app, subpath);

  // setup v1 api
  v1(app);

  return app;
};
