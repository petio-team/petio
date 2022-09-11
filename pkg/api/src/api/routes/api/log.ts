import Router from '@koa/router';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import path from 'path';

import { adminRequired } from '@/api/middleware/auth';
import env from '@/config/env';

let liveLogfile = path.join(env.paths.data, './logs/live1.log');
let liveLogfile2 = path.join(env.paths.data, './logs/live.log');

const route = new Router({ prefix: 'logs/' });

export default (app: Router) => {
  route.get('/stream', adminRequired, streamLog);

  app.use(route.routes());
};

const streamLog = async (ctx: Context) => {
  let dataNew, dataOld;
  try {
    let logsNew = fs.readFileSync(liveLogfile, 'utf8');
    dataNew = JSON.parse(`[${logsNew.replace(/,\s*$/, '')}]`);
  } catch {
    dataNew = [];
  }

  try {
    let logsOld = fs.readFileSync(liveLogfile2, 'utf8');
    dataOld = JSON.parse(`[${logsOld.replace(/,\s*$/, '')}]`);
  } catch {
    dataOld = [];
  }

  let data = [...dataNew, ...dataOld];

  ctx.status = StatusCodes.OK;
  ctx.body = data;
};
