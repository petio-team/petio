import Koa from 'koa';
import koaBody from 'koa-body';
import compress from 'koa-compress';
import mount from 'koa-mount';

import responseHandler from '@/api/http/responseHandler';
import cors from '@/api/middleware/cors';
import errorHandler from '@/api/middleware/errorHandling';
import logging from '@/api/middleware/logging';
import options from '@/api/middleware/options';
import api from '@/api/routes/api';
import web from '@/api/routes/web';
import {
  HTTP_ADDR,
  HTTP_BASE_PATH,
  HTTP_PORT,
  HTTP_TRUSTED_PROXIES,
} from '@/infrastructure/config/env';
import { getFromContainer } from '@/infrastructure/container/container';
import { HttpServer } from '@/infrastructure/http/http-server';
import { SettingsSchemaProps } from '@/resources/settings/schema';
import { SettingsService } from '@/services/settings/settings';

const routes = (settings: SettingsSchemaProps): Koa => {
  const app = new Koa();
  app.keys = settings.appKeys ?? [];

  // setup old api
  api(app, HTTP_BASE_PATH, !settings.initialSetup);

  // web/frontend/react
  web(app);

  return app;
};

export const createKoaServer = async () => {
  const app = new Koa();
  const settings = await getFromContainer(SettingsService).getSettings();

  await getFromContainer(HttpServer).start(
    HTTP_ADDR,
    HTTP_PORT,
    app.callback(),
  );

  // Set security keys
  app.keys = settings.appKeys ?? [];

  // Enable trusted proxies
  if (HTTP_TRUSTED_PROXIES.length > 0) {
    app.proxy = true;
  }

  // Add middleware
  [
    logging(),
    cors(),
    compress({ threshold: 2048 }),
    koaBody(),
    options(),
    responseHandler(),
    errorHandler(),
  ].forEach((middleware) => app.use(middleware));

  // Mount endpoints
  app.use(mount(HTTP_BASE_PATH, routes(settings)));
};
