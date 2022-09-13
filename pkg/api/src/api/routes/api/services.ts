import Router from '@koa/router';
import bluebird from 'bluebird';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { adminRequired } from '@/api/middleware/auth';
import { validateRequest } from '@/api/middleware/validation';
import RadarrAPI, { GetRadarrInstanceFromDb } from '@/infra/arr/radarr';
import SonarrAPI, { GetSonarrInstanceFromDb } from '@/infra/arr/sonarr';
import logger from '@/loaders/logger';
import {
  CreateOrUpdateDownloader,
  DeleteDownloaderById,
  DownloaderType,
  GetAllDownloaders,
} from '@/models/downloaders';

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
    port: z.number(),
    subpath: z.string().min(1).default('/'),
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
    availability: z.object({
      id: z.number(),
      name: z.string(),
    }),
    token: z.string().min(1),
  }),
);
type ArrInput = z.infer<typeof ArrInputSchema>;

export default (app: Router) => {
  route.get(
    '/sonarr/options/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getSonarrOptionsById,
  );
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
  route.get(
    '/sonarr/config',
    validateRequest({
      query: z.object({
        withExtras: z.any().optional(),
      }),
    }),
    adminRequired,
    getSonarrConfig,
  );
  route.get('/calendar', getCalendarData);
  route.post(
    '/sonarr/config',
    validateRequest({
      body: ArrInputSchema,
    }),
    adminRequired,
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
    '/radarr/options/:id',
    validateRequest({
      params: z.object({
        id: z.string().uuid(),
      }),
    }),
    adminRequired,
    getRadarrOptionsById,
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
    getRadarrLanguagesById,
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
  route.get(
    '/radarr/config',
    validateRequest({
      query: z.object({
        withExtras: z.any().optional(),
      }),
    }),
    adminRequired,
    getRadarrConfig,
  );
  route.post(
    '/radarr/config',
    validateRequest({
      body: ArrInputSchema,
    }),
    adminRequired,
    updateRadarrConfig,
  );
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

const getSonarrOptionsById = async (ctx: Context) => {
  try {
    const instance = await GetSonarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const [paths, profiles, languages, tags] = await Promise.all([
      instance.GetRootPaths(),
      instance.GetQualityProfiles(),
      instance.GetLanguageProfile(),
      instance.GetTags(),
    ]);

    ctx.status = StatusCodes.OK;
    ctx.body = {
      paths,
      profiles,
      languages,
      tags,
    };
  } catch (error) {
    logger.error(error.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
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
  const withExtras = ctx.request.query.withExtras;

  try {
    const instances = await GetAllDownloaders(DownloaderType.Sonarr);

    const results = await bluebird.map(instances, async (instance) => {
      const url = new URL(instance.url);
      const api = new SonarrAPI(url, instance.token, instance.version);

      const protocol = url.protocol.substring(0, url.protocol.length - 1);

      let port: number;
      if (!url.port) {
        port = url.protocol === 'http' ? 80 : 443;
      } else {
        port = parseInt(url.port);
      }

      let paths: any | undefined = undefined;
      let profiles: any | undefined = undefined;
      let languages: any | undefined = undefined;
      let availabilities: any | undefined = undefined;

      if (withExtras) {
        [paths, profiles, languages, availabilities] = await Promise.all([
          api.GetRootPaths(),
          api.GetQualityProfiles(),
          api.GetLanguages(),
          api.GetSeriesTypes(),
        ]);
      }

      return {
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
        availability: {
          id: instance.availability.id,
          name: instance.availability.name,
        },
        enabled: instance.enabled,
        paths,
        profiles,
        languages,
        availabilities,
      };
    });

    ctx.status = StatusCodes.OK;
    ctx.body = results;
  } catch (error) {
    console.log(error);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const updateSonarrConfig = async (ctx: Context) => {
  let data = ctx.request.body as ArrInput;

  try {
    const results = await bluebird.map(data, async (instance) => {
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

      const api = new SonarrAPI(url, instance.token);
      try {
        const passed = await api.TestConnection();
        if (!passed) {
          throw new Error('test failed');
        }
      } catch (e) {
        ctx.status = StatusCodes.BAD_REQUEST;
        ctx.body = {
          error: e.message,
        };
        return;
      }

      const newInstance = await CreateOrUpdateDownloader({
        name: instance.name,
        type: DownloaderType.Sonarr,
        url: url.toString(),
        token: instance.token,
        version: api.GetVersion().toString(),
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        availability: instance.availability,
        enabled: instance.enabled,
      });

      const [paths, profiles, languages, availabilities] = await Promise.all([
        api.GetRootPaths(),
        api.GetQualityProfiles(),
        api.GetLanguages(),
        api.GetSeriesTypes(),
      ]);

      return {
        id: newInstance.id,
        name: instance.name,
        protocol: instance.protocol,
        host: instance.host,
        port: instance.port,
        subpath: instance.subpath === '' ? '/' : '',
        token: instance.token,
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        availability: instance.availability,
        enabled: instance.enabled,
        paths,
        profiles,
        languages,
        availabilities,
      };
    });

    ctx.status = StatusCodes.OK;
    ctx.body = results;
    return;
  } catch (error) {
    logger.log('error', `ROUTE: Error saving sonarr config`);
    logger.log({ level: 'error', message: error });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: error };
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
          ? new SonarrAPI(url, instance.token, instance.version)
          : new RadarrAPI(url, instance.token, instance.version);

      return api.Calendar(
        true,
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
        new Date(now.getFullYear(), now.getMonth() + 2, 1),
      );
    });

    ctx.status = StatusCodes.OK;
    ctx.body = calendarData;
  } catch (error) {
    logger.error(error);
    ctx.status = StatusCodes.OK;
    ctx.body = [];
  }
};

const getRadarrOptionsById = async (ctx: Context) => {
  try {
    const instance = await GetRadarrInstanceFromDb(ctx.params.id);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const [paths, profiles, languages, tags, minimumAvailability] =
      await Promise.all([
        instance.GetRootPaths(),
        instance.GetQualityProfiles(),
        instance.GetLanguages(),
        instance.GetTags(),
        instance.GetMinimumAvailability(),
      ]);

    ctx.status = StatusCodes.OK;
    ctx.body = {
      paths,
      profiles,
      languages,
      tags,
      minimumAvailability,
    };
  } catch (error) {
    logger.error(error);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {
      error: 'failed to get radarr options',
    };
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

const getRadarrLanguagesById = async (ctx: Context) => {
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
  const withExtras = ctx.request.query.withExtras;

  try {
    const instances = await GetAllDownloaders(DownloaderType.Radarr);
    const results = await bluebird.map(instances, async (instance) => {
      const url = new URL(instance.url);
      const api = new RadarrAPI(url, instance.token, instance.version);

      const protocol = url.protocol.substring(0, url.protocol.length - 1);

      let port: number;
      if (!url.port) {
        port = url.protocol === 'http' ? 80 : 443;
      } else {
        port = parseInt(url.port);
      }

      let paths: any | undefined = undefined;
      let profiles: any | undefined = undefined;
      let languages: any | undefined = undefined;
      let availabilities: any | undefined = undefined;

      if (withExtras) {
        [paths, profiles, languages, availabilities] = await Promise.all([
          api.GetRootPaths(),
          api.GetQualityProfiles(),
          api.GetLanguages(),
          api.GetMinimumAvailability(),
        ]);
      }

      return {
        id: instance.id,
        name: instance.name,
        protocol: protocol,
        host: url.host,
        port: port,
        subpath: url.pathname === '' ? '/' : url.pathname,
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
        availability: {
          id: instance.availability.id,
          name: instance.availability.name,
        },
        enabled: instance.enabled,
        paths,
        profiles,
        languages,
        availabilities,
      };
    });

    ctx.status = StatusCodes.OK;
    ctx.body = results;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const updateRadarrConfig = async (ctx: Context) => {
  let data = ctx.request.body as ArrInput;

  try {
    const results = await bluebird.map(data, async (instance) => {
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

      const api = new RadarrAPI(url, instance.token);
      try {
        const passed = await api.TestConnection();
        if (!passed) {
          throw new Error('test failed');
        }
      } catch (e) {
        ctx.status = StatusCodes.BAD_REQUEST;
        ctx.body = {
          error: e.message,
        };
        return;
      }

      const newInstance = await CreateOrUpdateDownloader({
        name: instance.name,
        type: DownloaderType.Radarr,
        url: url.toString(),
        token: instance.token,
        version: api.GetVersion().toString(),
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        availability: instance.availability,
        enabled: instance.enabled,
      });

      const [paths, profiles, languages, availabilities] = await Promise.all([
        api.GetRootPaths(),
        api.GetQualityProfiles(),
        api.GetLanguages(),
        api.GetMinimumAvailability(),
      ]);

      return {
        id: newInstance.id,
        name: instance.name,
        protocol: instance.protocol,
        host: instance.host,
        port: instance.port,
        subpath: instance.subpath === '' ? '/' : instance.subpath,
        token: instance.token,
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        availability: instance.availability,
        enabled: instance.enabled,
        paths,
        profiles,
        languages,
        availabilities,
      };
    });

    ctx.status = StatusCodes.OK;
    ctx.body = results;
    return;
  } catch (error) {
    logger.log('error', `ROUTE: Error saving radarr config`);
    logger.log({ level: 'error', message: error });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = { error: error };
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
