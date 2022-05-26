import cors from '@koa/cors';
import { StatusCodes } from 'http-status-codes';
import Koa from 'koa';
import koaBody from 'koa-body';
import helmet from 'koa-helmet';
import morgan from 'koa-morgan';
import mount from 'koa-mount';

import routes from '@/api/index';
import { env } from '@/config/env';
import { config } from '@/config/index';
import logger from '@/loaders/logger';

export default ({ app }: { app: Koa }) => {
  // Add http logging using morgan
  app.use(
    morgan((tokens: any, req: any, res: any) => {
      const msg = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
      ].join(' ');
      logger.http(msg);
      return null;
    }, {}),
  );

  // Add error handling
  app.use(async (ctx, next) => {
    // call our next middleware
    try {
      await next();
    } catch (error) {
      ctx.status =
        error.statusCode || error.status || StatusCodes.INTERNAL_SERVER_ERROR;
      error.status = ctx.status;
      ctx.body = { error };
      ctx.app.emit('error', error, ctx);
    }
  });

  // Enable trusted proxies
  app.proxy = true;

  // Implement important security headers
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'plex.tv',
          '*.plex.tv',
          '*.fanart.tv',
          '*.tmdb.org',
          'secure.gravatar.com',
        ],
        connectSrc: ["'self'", 'plex.tv'],
      },
    }),
  );

  // Enable cors
  app.use(
    cors({
      origin: env === 'development' ? 'http://localhost:3001' : 'origin',
      credentials: true,
    }),
  );

  // Enable body parsing
  app.use(koaBody());

  // Load routes
  const subpath =
    config.get('petio.subpath') !== '/' ? config.get('petio.subpath') : '/';
  app.use(mount(subpath, routes()));

  // Handle errors
  app.on('error', (err) => logger.error(err));
};
