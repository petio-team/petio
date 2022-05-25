import Router from '@koa/router';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { authRequired } from '@/api/middleware/auth';
import { WriteConfig } from '@/config/config';
import { config } from '@/config/schema';
import logger from '@/loaders/logger';
import plexLookup from '@/plex/lookup';
import MakePlexURL from '@/plex/util';

const route = new Router({ prefix: '/plex' });

export default (app: Router) => {
  route.get('/lookup/:type/:id', lookupByIdAndType);
  route.get('/test_plex', testPlexConnection);

  app.use(route.routes());
};

const lookupByIdAndType = async (ctx: Context) => {
  let type = ctx.params.type;
  let id = ctx.params.id;
  if (!type || !id || type === 'undefined' || type === 'undefined') {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = { error: 'invalid fields provided' };
  } else {
    ctx.status = StatusCodes.OK;
    ctx.body = await plexLookup(id, type);
  }
};

const testPlexConnection = async (ctx: Context) => {
  const url = MakePlexURL('/').toString();
  try {
    await axios.get(
      `https://plex.tv/pms/resources?X-Plex-Token=${config.get('plex.token')}`,
    );
    let connection = await axios.get(url);
    let data = connection.data.MediaContainer;
    if (
      data.myPlexUsername === config.get('admin.username') ||
      data.myPlexUsername === config.get('admin.email')
    ) {
      await updateCredentials({ plexClientID: data.machineIdentifier });
      ctx.status = StatusCodes.OK;
      ctx.body = {
        connection: true,
        error: false,
      };
      return;
    } else {
      ctx.status = StatusCodes.OK;
      ctx.body = {
        connection: false,
        error: 'You are not the owner of this server',
      };
      return;
    }
  } catch (err) {
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {
      connection: false,
      error: 'Plex connection test failed',
    };
  }
};

async function updateCredentials(obj) {
  if (obj.plexClientID == undefined) {
    throw 'plex client id does not exist in object';
  }

  config.set('plex.client', obj.plexClientID);
  try {
    await WriteConfig();
  } catch (err) {
    logger.log({ level: 'error', message: err });
    logger.error('PLX: Error config not found');
  }
}
