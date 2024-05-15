import { Server } from 'http';
import Koa from 'koa';
import koaBody from 'koa-body';
import compress from 'koa-compress';
import mount from 'koa-mount';
import { AddressInfo } from 'net';
import { IncomingMessage, ServerResponse } from 'node:http';
import { promisify } from 'util';

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
import { SettingsService } from '@/services/settings/settings';

const routes = (keys: string[]): Koa => {
  const app = new Koa();
  app.keys = keys;

  // setup old api
  api(app, HTTP_BASE_PATH);

  // web/frontend/react
  web(app);

  return app;
};

export const createKoaServer = async () => {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  const app = new Koa();
  const settings = await getFromContainer(SettingsService).getSettings();

  // Set security keys
  app.keys = settings.appKeys;

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
  app.use(mount(HTTP_BASE_PATH, routes(settings.appKeys)));

  let serverShuttingDown: any;

  const stop = () => {
    if (serverShuttingDown) {
      return serverShuttingDown;
    }
    serverShuttingDown = promisify(server.close.bind(server));
    return serverShuttingDown;
  };

  const getConnection = () => promisify(server.getConnections.bind(server))();

  return new Promise((resolve, reject) => {
    server = app.listen(HTTP_PORT, HTTP_ADDR, () => {
      const { port } = server.address() as AddressInfo;
      const url = `http://localhost:${port}`;

      resolve({
        stop,
        getConnection,
        port,
        server,
        url,
      });
    });

    server.once('error', reject);
  });
};
