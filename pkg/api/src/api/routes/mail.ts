import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import { WriteConfig } from '@/config/config';
import { config } from '@/config/index';
import logger from '@/infra/logger/logger';
import Mailer from '@/services/mail/mailer';

const createMail = async (ctx: Context) => {
  const { email } = ctx.request.body;

  if (!email) {
    logger.log('error', 'MAILER: Update email config failed');

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = 'missing fields';
    return;
  }

  config.set('email.enabled', email.enabled);
  config.set('email.username', email.user);
  config.set('email.password', email.pass);
  config.set('email.host', email.server);
  config.set('email.port', email.port);
  config.set('email.ssl', email.secure);
  config.set('email.from', email.from);

  try {
    await WriteConfig();
  } catch (e) {
    logger.error(e);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = 'failed to write config to filesystem';
    return;
  }

  logger.log('debug', 'MAILER: Config updated');

  ctx.status = StatusCodes.OK;
  ctx.body = { config: config.get('email') };
};

const getMailConfig = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = {
    config: {
      emailEnabled: config.get('email.enabled'),
      emailUser: config.get('email.username'),
      emailPass: config.get('email.password'),
      emailServer: config.get('email.host'),
      emailPort: config.get('email.port'),
      emailSecure: config.get('email.ssl'),
      emailFrom: config.get('email.from'),
    },
  };
};

const testConnection = async (ctx: Context) => {
  const test = await new Mailer().test();

  ctx.status = StatusCodes.OK;
  ctx.body = { result: test.result, error: test.error };
};

const route = new Router({ prefix: '/mail' });
export default (app: Router) => {
  route.post(
    '/create',
    validateRequest({
      body: z.object({
        email: z.object({
          server: z.string().min(1),
          port: z.string().transform((val, ctx) => {
            const parsed = parseInt(val, 10);
            if (Number.isNaN(parsed)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'failed to parse port into a valid number',
              });
            }
            return parsed;
          }),
          user: z.string().min(1),
          pass: z.string().min(1),
          from: z.string().min(1),
          secure: z.boolean(),
          enabled: z.boolean(),
        }),
      }),
    }),
    createMail,
  );
  route.get('/config', getMailConfig);
  route.get('/test', testConnection);

  app.use(route.routes());
};
