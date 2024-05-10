import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { validateRequest } from '@/api/middleware/validation';
import Mailer from '@/services/mail/mailer';

const createMail = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = {};
};

const getMailConfig = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = {};
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
