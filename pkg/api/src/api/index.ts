import { Server } from 'http';
import Koa from 'koa';
import koaBody from 'koa-body';
import compress from 'koa-compress';
import mount from 'koa-mount';
import { AddressInfo } from 'net';
import { IncomingMessage, ServerResponse } from 'node:http';
import { promisify } from 'util';

import cors from '@/api/middleware/cors';
import errorHandler from '@/api/middleware/errorHandling';
import api from '@/api/routes/api';
import web from '@/api/routes/web';
import { config } from '@/config/index';
import {
  HTTP_ADDR,
  HTTP_BASE_PATH,
  HTTP_PORT,
  HTTP_TRUSTED_PROXIES,
} from '@/infra/config/env';

import responseHandler from './http/responseHandler';
import logging from './middleware/logging';
import options from './middleware/options';

const routes = (): Koa => {
  const app = new Koa();

  // web/frontend/reac
  web(app);

  // setup old api
  api(app, HTTP_BASE_PATH);

  return app;
};

export const createKoaServer = () => {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  const app = new Koa();

  // Set security keys
  app.keys = config.get('petio.keys');

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
  app.use(mount(HTTP_BASE_PATH, routes()));

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
