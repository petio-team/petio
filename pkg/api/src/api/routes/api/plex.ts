import Router from '@koa/router';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { WriteConfig } from '@/config/config';
import { config } from '@/config/index';
import logger from '@/loaders/logger';
import { UserModel } from '@/models/user';
import plexLookup from '@/services/plex/lookup';
import MakePlexURL from '@/services/plex/util';

const route = new Router({ prefix: '/plex' });

export default (app: Router) => {
  route.get('/lookup/:type/:id', lookupByIdAndType);
  route.get('/test_plex', testPlexConnection);

  app.use(route.routes());
};

const lookupByIdAndType = async (ctx: Context) => {
  const {type} = ctx.params;
  const {id} = ctx.params;
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
    const admin = await UserModel.findOne({ owner: true }).exec();
    if (!admin) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no admin user could be found';
      return;
    }

    await axios.get(
      `https://plex.tv/pms/resources?X-Plex-Token=${config.get('plex.token')}`,
    );
    const connection = await axios.get(url);
    const data = connection.data.MediaContainer;
    if (
      data.myPlexUsername === admin.username ||
      data.myPlexUsername === admin.email
    ) {
      await updateCredentials({ plexClientID: data.machineIdentifier });
      ctx.status = StatusCodes.OK;
      ctx.body = {
        connection: true,
        error: false,
      };
      return;
    } 
      ctx.status = StatusCodes.OK;
      ctx.body = {
        connection: false,
        error: 'You are not the owner of this server',
      };
      return;
    
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
