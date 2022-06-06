import Router from '@koa/router';
import bluebird from 'bluebird';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { adminRequired } from '@/api/middleware/auth';
import { GetRadarrInstanceFromDb } from '@/arr/radarr';
import { GetSonarrInstanceFromDb } from '@/arr/sonarr';
import logger from '@/loaders/logger';
import {
  CreateOrUpdateDownloader,
  DeleteDownloaderById,
  DownloaderType,
  GetAllDownloaders,
  IDownloader,
} from '@/models/downloaders';

import RadarrAPI from '../../arr/radarr';
import SonarrAPI from '../../arr/sonarr';
import { validateRequest } from '../middleware/validation';

const route = new Router({ prefix: '/services' });

enum HttpProtocol {
  Http = 'http',
  Https = 'https',
}

const ArrInputSchema = z.array(
  z.object({
    enabled: z.boolean(),
    name: z.string().min(1),
    protocol: z.nativeEnum(HttpProtocol),
    host: z.string().min(1),
    port: z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'failed to parse port into a valid number',
        });
      }
      return parsed;
    }),
    subpath: z.string().default('/'),
    path: z.object({
      id: z.number(),
      location: z.string(),
    }),
    profile: z.object({
      id: z.number(),
      name: z.string(),
    }),
    language: z.object({
      id: z.number(),
      name: z.string(),
    }),
    token: z.string().min(1),
  }),
);
type ArrInput = z.infer<typeof ArrInputSchema>;

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
  route.post(
    '/sonarr/config',
    adminRequired,
    validateRequest({
      body: ArrInputSchema,
    }),
    updateSonarrConfig,
  );
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
  route.post('/radarr/config', adminRequired, updateRadarrConfig);
  route.delete(
    '/radarr/:id',
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
  try {
    const instance = await GetSonarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const paths = await instance.GetRootPaths();
    const results = paths.map((path) => {
      return {
        id: path.id,
        path: path.path,
        accessible: path.accessible,
        freeSpace: path.freeSpace,
      };
    });

    ctx.status = StatusCodes.OK;
    ctx.body = results;
  } catch (error) {
    logger.error(error.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrProfilesById = async (ctx: Context) => {
  try {
    const instance = await GetSonarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const profiles = await instance.GetQualityProfiles();

    ctx.status = StatusCodes.OK;
    ctx.body = profiles;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrLanguagesById = async (ctx: Context) => {
  try {
    const instance = await GetSonarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const languages = await instance.GetLanguageProfile();

    ctx.status = StatusCodes.OK;
    ctx.body = languages;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrTagsById = async (ctx: Context) => {
  try {
    const instance = await GetSonarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const tags = await instance.GetTags();

    ctx.status = StatusCodes.OK;
    ctx.body = tags;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const testSonarrConnectionById = async (ctx: Context) => {
  try {
    const instance = await GetSonarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const test = await instance.TestConnection();
    let data = {
      connection: test,
    };

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrConfig = async (ctx: Context) => {
  try {
    const instances = await GetAllDownloaders(DownloaderType.Sonarr);

    const response = Array<any>();
    for (const instance of instances) {
      const url = new URL(instance.url);

      const protocol = url.protocol.substring(0, url.protocol.length - 1);

      let port: string;
      if (!url.port) {
        port = url.protocol === 'http' ? '80' : '443';
      } else {
        port = url.port;
      }

      response.push({
        id: instance.id,
        name: instance.name,
        protocol: protocol,
        host: url.host,
        port: port,
        subpath: url.pathname,
        token: instance.token,
        profile: {
          id: instance.profile.id,
          name: instance.profile.name,
        },
        path: {
          id: instance.path.id,
          location: instance.path.location,
        },
        language: {
          id: instance.language.id,
          name: instance.language.name,
        },
        enabled: instance.enabled,
      });
    }

    ctx.status = StatusCodes.OK;
    ctx.body = response;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const updateSonarrConfig = async (ctx: Context) => {
  let data = ctx.request.body as ArrInput;

  try {
    for (const instance of data) {
      if (instance.subpath.startsWith('/')) {
        instance.subpath = instance.subpath.substring(1);
      }

      const url = new URL(
        instance.protocol +
          '://' +
          instance.host +
          ':' +
          instance.port +
          '/' +
          instance.subpath,
      );

      await CreateOrUpdateDownloader({
        name: instance.name,
        type: DownloaderType.Sonarr,
        url: url.toString(),
        token: instance.token,
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        enabled: instance.enabled,
      });
    }

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
  try {
    const deleted = await DeleteDownloaderById(ctx.params.id);
    if (!deleted) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'failed to delete instance with the id: ' + ctx.params.id;
      return;
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {
      status: 'success',
      error: null,
      message: 'instance successfully removed',
      data: {},
    };
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getCalendarData = async (ctx: Context) => {
  try {
    const instances = await GetAllDownloaders();
    if (!instances.length) {
      ctx.status = StatusCodes.OK;
      ctx.body = [];
      return;
    }

    const now = new Date();

    const calendarData = await bluebird.map(instances, async (instance) => {
      const url = new URL(instance.url);
      const api =
        instance.type === DownloaderType.Sonarr
          ? new SonarrAPI(url, instance.token)
          : new RadarrAPI(url, instance.token);

      return api.Calendar(
        true,
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
        new Date(now.getFullYear(), now.getMonth() + 2, 1),
      );
    });

    ctx.status = StatusCodes.OK;
    ctx.body = calendarData;
  } catch (err) {
    logger.error(err);

    ctx.status = StatusCodes.OK;
    ctx.body = [];
  }
};

const getRadarrPathsById = async (ctx: Context) => {
  try {
    const instance = await GetRadarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const paths = await instance.GetRootPaths();
    const results = paths.map((path) => {
      return {
        id: path.id,
        path: path.path,
        accessible: path.accessible,
        freeSpace: path.freeSpace,
      };
    });

    ctx.status = StatusCodes.OK;
    ctx.body = results;
  } catch (error) {
    logger.error(error.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrProfilesById = async (ctx: Context) => {
  try {
    const instance = await GetRadarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const profiles = await instance.GetQualityProfiles();

    ctx.status = StatusCodes.OK;
    ctx.body = profiles;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrLangugaesById = async (ctx: Context) => {
  try {
    const instance = await GetRadarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const languages = await instance.GetLanguages();

    ctx.status = StatusCodes.OK;
    ctx.body = languages;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrTagsById = async (ctx: Context) => {
  try {
    const instance = await GetRadarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const tags = await instance.GetTags();

    ctx.status = StatusCodes.OK;
    ctx.body = tags;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const testRadarrConnectionById = async (ctx: Context) => {
  try {
    const instance = await GetRadarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const test = await instance.TestConnection();
    let data = {
      connection: test,
    };

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrConfig = async (ctx: Context) => {
  try {
    const instances = await GetAllDownloaders(DownloaderType.Radarr);

    const response = Array<any>();
    for (const instance of instances) {
      const url = new URL(instance.url);

      const protocol = url.protocol.substring(0, url.protocol.length - 1);

      let port: string;
      if (!url.port) {
        port = url.protocol === 'http' ? '80' : '443';
      } else {
        port = url.port;
      }

      response.push({
        id: instance.id,
        name: instance.name,
        protocol: protocol,
        host: url.host,
        port: port,
        subpath: url.pathname,
        token: instance.token,
        profile: {
          id: instance.profile.id,
          name: instance.profile.name,
        },
        path: {
          id: instance.path.id,
          location: instance.path.location,
        },
        language: {
          id: instance.language.id,
          name: instance.language.name,
        },
        enabled: instance.enabled,
      });
    }

    ctx.status = StatusCodes.OK;
    ctx.body = response;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const updateRadarrConfig = async (ctx: Context) => {
  let data = ctx.request.body as ArrInput;

  try {
    const results: IDownloader[] = [];
    for (const instance of data) {
      if (instance.subpath.startsWith('/')) {
        instance.subpath = instance.subpath.substring(1);
      }

      const url = new URL(
        instance.protocol +
          '://' +
          instance.host +
          ':' +
          instance.port +
          '/' +
          instance.subpath,
      );

      const newInstance = await CreateOrUpdateDownloader({
        name: instance.name,
        type: DownloaderType.Radarr,
        url: url.toString(),
        token: instance.token,
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        enabled: instance.enabled,
      });

      results.push(newInstance);
    }

    ctx.status = StatusCodes.OK;
    ctx.body = results;
    return;
  } catch (err) {
    logger.log('error', `ROUTE: Error saving sonarr config`);
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: err };
    return;
  }
};

const deleteRadarrById = async (ctx: Context) => {
  try {
    const deleted = await DeleteDownloaderById(ctx.params.id);
    if (!deleted) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'failed to delete instance with the id: ' + ctx.params.id;
      return;
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {
      status: 'success',
      error: null,
      message: 'instance successfully removed',
      data: {},
    };
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};
