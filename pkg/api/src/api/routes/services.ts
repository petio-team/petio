import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { adminRequired } from '@/api/middleware/auth';
import { WriteConfig, config } from '@/config/index';
import Radarr from '@/downloaders/radarr';
import Sonarr from '@/downloaders/sonarr';
import logger from '@/loaders/logger';

import { validateRequest } from '../middleware/validation';

const route = new Router({ prefix: '/services' });

export default (app: Router) => {
  route.get(
    '/sonarr/paths/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getSonarrPathsById,
  );
  route.get(
    '/sonarr/profiles/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getSonarrProfilesById,
  );
  route.get(
    '/sonarr/languages/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getSonarrLanguagesById,
  );
  route.get(
    '/sonarr/tags/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getSonarrTagsById,
  );
  route.get(
    '/sonarr/test/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    testSonarrConnectionById,
  );
  route.get('/sonarr/config', adminRequired, getSonarrConfig);
  route.get('/calendar', getCalendarData);
  route.post('/sonarr/config', adminRequired, updateSonarrConfig);
  route.delete(
    '/sonarr/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    deleteSonarrById,
  );
  route.get(
    '/radarr/paths/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getRadarrPathsById,
  );
  route.get(
    '/radarr/profiles/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getRadarrProfilesById,
  );
  route.get(
    '/radarr/languages/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getRadarrLangugaesById,
  );
  route.get(
    '/radarr/tags/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getRadarrTagsById,
  );
  route.get(
    '/radarr/test/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    testRadarrConnectionById,
  );
  route.get('/radarr/config', adminRequired, getRadarrConfig);
  route.get('/radarr/test', adminRequired, testRadarrConnection);
  route.post('/radarr/config', adminRequired, updateRadarrConfig);
  route.delete(
    '/radarr/:uuid',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    deleteRadarrById,
  );

  app.use(route.routes());
};

const getSonarrPathsById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    let data = await new Sonarr().getPaths(ctx.params.id);

    data.forEach((el) => {
      delete el.unmappedFolders;
    });

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch {
    ctx.status = StatusCodes.OK;
    ctx.body = {};
  }
};

const getSonarrProfilesById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new Sonarr().getProfiles(ctx.params.id);
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getSonarrLanguagesById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new Sonarr().getLanguageProfiles(ctx.params.id);
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getSonarrTagsById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new Sonarr().getTags(ctx.params.id);
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const testSonarrConnectionById = async (ctx: Context) => {
  let data = {
    connection: await new Sonarr().test(ctx.params.id),
  };

  ctx.status = StatusCodes.OK;
  ctx.body = data;
};

const getSonarrConfig = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = new Sonarr().getConfig();
};

const updateSonarrConfig = async (ctx: Context) => {
  let data = ctx.request.body.data;
  ConvertToConfig('sonarr', JSON.parse(data));

  try {
    await WriteConfig();

    ctx.status = StatusCodes.OK;
    ctx.body = data;
    return;
  } catch (err) {
    logger.log('error', `ROUTE: Error saving sonarr config`);
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
    return;
  }
};

const deleteSonarrById = async (ctx: Context) => {
  let uuid = ctx.params.id;
  if (uuid == undefined) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {
      status: 'error',
      error: 'missing the required `uuid` field',
      message: null,
      data: {},
    };
    return;
  }

  let sonarrs = config.get('sonarr');
  const match = sonarrs.filter((el) => el.uuid == uuid);

  if (match.length == 0) {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {
      status: 'error',
      error: 'no matching instance exists with the uuid: ' + uuid,
      message: null,
      data: {},
    };
    return;
  }

  sonarrs = sonarrs.filter((el) => el.uuid != uuid);
  config.set('sonarr', sonarrs);

  try {
    await WriteConfig();
  } catch (e) {
    logger.error(e);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      status: 'error',
      error: 'failed to write to config file',
      message: null,
      data: {},
    };
    return;
  }

  ctx.status = StatusCodes.OK;
  ctx.body = {
    status: 'success',
    error: null,
    message: 'instance successfully removed',
    data: sonarrs,
  };
};

const getCalendarData = async (ctx: Context) => {
  try {
    let sonarr = await new Sonarr().calendar();
    let radarr = await new Radarr().calendar();
    let full = [...sonarr, ...radarr];

    ctx.status = StatusCodes.OK;
    ctx.body = full;
  } catch (err) {
    logger.error(err);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getRadarrPathsById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    let data = await new Radarr(ctx.params.id).getPaths();

    data.forEach((el) => {
      delete el.unmappedFolders;
    });

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (err) {
    logger.log('warn', `ROUTE: Enable to get Radarr paths`);
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getRadarrProfilesById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new Radarr(ctx.params.id).getProfiles();
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getRadarrLangugaesById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new Radarr(ctx.params.id).getLanguageProfiles();
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getRadarrTagsById = async (ctx: Context) => {
  if (!ctx.params.id) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }
  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new Radarr(ctx.params.id).getTags();
  } catch {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const testRadarrConnectionById = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = {
    connection: await new Radarr(ctx.params.id).test(),
  };
};

const getRadarrConfig = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = new Radarr().getConfig();
};

const testRadarrConnection = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = {
    connection: await new Radarr().test(),
  };
};

const updateRadarrConfig = async (ctx: Context) => {
  let data = ctx.request.body.data;
  ConvertToConfig('radarr', JSON.parse(data));

  try {
    WriteConfig();

    ctx.status = StatusCodes.OK;
    ctx.body = data;
    return;
  } catch (err) {
    logger.log('error', `ROUTE: Error saving radarr config`);
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
    return;
  }
};

const deleteRadarrById = async (ctx: Context) => {
  let uuid = ctx.params.uuid;
  if (uuid == undefined) {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {
      status: 'error',
      error: 'missing the required `uuid` field',
      message: null,
      data: {},
    };
    return;
  }

  let radarrs = config.get('radarr');
  const match = radarrs.filter((el) => el.uuid == uuid);
  if (match.length == 0) {
    ctx.status = StatusCodes.BAD_REQUEST;
    ctx.body = {
      status: 'error',
      error: 'no matching instance exists with the uuid: ' + uuid,
      message: null,
      data: {},
    };
    return;
  }

  radarrs = radarrs.filter((el) => el.uuid != uuid);
  config.set('radarr', radarrs);

  try {
    await WriteConfig();
  } catch (e) {
    logger.error(e);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      status: 'error',
      error: 'failed to write to config file',
      message: null,
      data: {},
    };
    return;
  }

  ctx.status = StatusCodes.OK;
  ctx.body = {
    status: 'success',
    error: null,
    message: 'instance successfully removed',
    data: radarrs,
  };

  return;
};

const ConvertToConfig = (entry, obj) => {
  if (obj == null || typeof obj !== 'object') {
    return;
  }

  if (obj.length == 0) {
    return;
  }

  const data: any = [];
  for (const [_, i] of Object.entries(obj)) {
    const val: any = i;
    const item: any = {};
    item.enabled = Boolean(val.enabled);
    item.title = String(val.title);
    item.protocol = String(val.protocol);
    item.host = val.host;
    item.port = parseInt(val.port);
    item.key = val.key;
    item.subpath = String(val.subpath);
    if (val.subpath === '') {
      item.subpath = '/';
    }

    item.path = {};
    if (val.path.id !== null) {
      item.path.id = Number(val.path.id);
    } else {
      item.path.id = 0;
    }
    if (val.path.location !== null) {
      item.path.location = String(val.path.location);
    } else {
      item.path.location = '';
    }

    item.profile = {};
    if (val.profile?.id !== null) {
      item.profile.id = Number(val.profile.id);
    } else {
      item.profile.id = 0;
    }
    if (val.profile.name !== null) {
      item.profile.name = String(val.profile.name);
    } else {
      item.profile.name = '';
    }

    item.language = {};
    if (val.language.id !== null) {
      item.language.id = Number(val.language.id);
    } else {
      item.language.id = 0;
    }
    if (val.language.name !== null) {
      item.language.name = String(val.language.name);
    } else {
      item.language.name = '';
    }

    item.uuid = val.uuid;
    data.push(item);
  }

  config.set(entry, data);
};
