import cors from '@koa/cors';
import { StatusCodes } from 'http-status-codes';
import Koa from 'koa';
import koaBody from 'koa-body';
import helmet from 'koa-helmet';
import morgan from 'koa-morgan';
import mount from 'koa-mount';

import routes from '@/api/index';
import { IsDevelopment, corsDomains } from '@/config/env';
import { config } from '@/config/index';
import logger from '@/loaders/logger';
import { removeSlashes } from '@/util/urls';

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
        scriptSrc: ["'self'", "'unsafe-inline'", 'www.youtube.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'plex.tv',
          '*.plex.tv',
          '*.tmdb.org',
          'assets.fanart.tv',
          'secure.gravatar.com',
        ],
        connectSrc: ["'self'", 'plex.tv'],
      },
    }),
  );

  // Enable cors
  const whitelist = corsDomains.split(',').map((domain) => domain.trim());
  if (IsDevelopment()) {
    // add local react dev
    whitelist.push('http://localhost:3000');
  }

  const corsOptions = {
    origin: async (ctx: Koa.Context): Promise<string> => {
      if (
        ctx.request.header.origin &&
        whitelist.indexOf(ctx.request.header.origin) !== -1
      ) {
        return ctx.request.header.origin;
      } else {
        return 'http://localhost:7777';
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  // Enable body parsing
  app.use(koaBody());

  // Load routes
  const subpath = removeSlashes(config.get('petio.subpath'));
  app.use(mount('/' + subpath, routes()));

  // Handle errors
  app.on('error', (err) => logger.error(err));
};
