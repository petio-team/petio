import Koa from 'koa';
import koaBody from 'koa-body';
import compress from 'koa-compress';
import mount from 'koa-mount';

import { logging } from './middleware/logging';
import session from './middleware/session';
import { cors } from '@/api/middleware/cors';
import { errorHandler } from '@/api/middleware/error_handling';
import api from '@/api/routes/api';
import web from '@/api/routes/web';
import { config } from '@/config/index';
import logger from '@/loaders/logger';
import { listen } from '@/utils/http';
import { removeSlashes } from '@/utils/urls';


export default () => {
  // create new koa instance
  const app = new Koa();

  // Set security keys
  app.keys = config.get('petio.keys');

  // Enable trusted proxies
  app.proxy = true;

  // Add error handling
  app.use(errorHandler);
  app.on('error', (err) => logger.error(err));

  // Add http logging using morgan
  app.use(logging());

  // Enable cors
  app.use(cors());

  // Enable compression
  app.use(
    compress({
      threshold: 2048,
    }),
  );

  // Enable body parsing
  app.use(koaBody());

  // get correctly formatted subpath
  const subpath = `/${  removeSlashes(config.get('petio.subpath'))}`;

  // session middleware
  app.use(session(app));

  // Mount endpoints
  app.use(mount(subpath, routes(subpath)));

  // run server
  listen({ httpApp: app });
};

const routes = (subpath: string): Koa => {
  const app = new Koa();

  // web/frontend/react
  web(app);

  // setup old api
  api(app, subpath);

  return app;
};
