import Router from '@koa/router';
import bluebird from 'bluebird';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { z } from 'zod';

import { adminRequired } from '@/api/middleware/auth';
import { validateRequest } from '@/api/middleware/validation';
import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { RadarrV3Client } from '@/infrastructure/servarr/radarr';
import { SonarrV3Client } from '@/infrastructure/servarr/sonarr';
import { DownloaderEntity } from '@/resources/downloader/entity';
import { DownloaderMapper } from '@/resources/downloader/mapper';
import { DownloaderRepository } from '@/resources/downloader/repository';
import { DownloaderType } from '@/resources/downloader/types';
import { ArrInput, ArrInputSchema } from '@/schemas/downloaders';

const SonarrAvailabilities = {
  0: 'Standard',
  1: 'Daily',
  2: 'Anime',
};

const RadarrAvailabilities = {
  0: 'Announced',
  1: 'In Cinemas',
  2: 'Released',
};

async function getInstances(type: DownloaderType) {
  const instances = await getFromContainer(DownloaderRepository).findAll({
    type,
  });
  const Cls = type === DownloaderType.SONARR ? SonarrV3Client : RadarrV3Client;
  return instances.map((i) => ({
    instance: i,
    client: new Cls({
      BASE: i.url.replace(/\/$/, ''),
      HEADERS: {
        'x-api-key': i.token,
      },
    }),
  }));
}

async function getInstance(
  id: string,
  type: DownloaderType.RADARR,
): Promise<RadarrV3Client | undefined>;
async function getInstance(
  id: string,
  type: DownloaderType.SONARR,
): Promise<SonarrV3Client | undefined>;
async function getInstance(id: string, type: DownloaderType) {
  const result = await getFromContainer(DownloaderRepository).findOne({
    id,
    type,
  });
  if (result.isSome()) {
    const instance = result.unwrap();
    const Cls =
      type === DownloaderType.SONARR ? SonarrV3Client : RadarrV3Client;
    return new Cls({
      BASE: instance.url.replace(/\/$/, ''),
      HEADERS: {
        'x-api-key': instance.token,
      },
    });
  }
  return undefined;
}

const getSonarrOptionsById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.SONARR);
    if (!instance) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_INSTANCE',
        message: `no instance was found with the id: ${ctx.params.id}`,
      });
      return;
    }

    const [paths, profiles, languages, tags] = await Promise.all([
      instance.rootFolder.getApiV3Rootfolder(),
      instance.qualityProfile.getApiV3Qualityprofile(),
      instance.language.getApiV3Language(),
      instance.tag.getApiV3Tag(),
    ]);

    ctx.success({
      statusCode: StatusCodes.OK,
      data: {
        paths,
        profiles,
        languages,
        tags,
      },
    });
  } catch (err) {
    logger.error(`failed to get sonarr options`, err);
    ctx.error({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'FAILED_GET_OPTIONS',
      message: 'failed to get sonarr options',
    });
  }
};

const getSonarrPathsById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.SONARR);
    if (!instance) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_INSTANCE',
        message: `no instance was found with the id: ${ctx.params.id}`,
      });
      return;
    }

    ctx.status = StatusCodes.OK;
    ctx.body = await instance.rootFolder.getApiV3Rootfolder();
  } catch (error) {
    logger.error(error.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrProfilesById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.SONARR);
    if (!instance) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_INSTANCE',
        message: `no instance was found with the id: ${ctx.params.id}`,
      });
      return;
    }

    const profiles = await instance.qualityProfile.getApiV3Qualityprofile();

    ctx.status = StatusCodes.OK;
    ctx.body = profiles;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrLanguagesById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.SONARR);
    if (!instance) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_INSTANCE',
        message: `no instance was found with the id: ${ctx.params.id}`,
      });
      return;
    }

    const languages = await instance.language.getApiV3Language();

    ctx.status = StatusCodes.OK;
    ctx.body = languages;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrTagsById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.SONARR);
    if (!instance) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_INSTANCE',
        message: `no instance was found with the id: ${ctx.params.id}`,
      });
      return;
    }

    const tags = await instance.tag.getApiV3Tag();

    ctx.status = StatusCodes.OK;
    ctx.body = tags;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const testSonarrConnectionById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.SONARR);
    if (!instance) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'INVALID_INSTANCE',
        message: `no instance was found with the id: ${ctx.params.id}`,
      });
      return;
    }

    const data = {
      connection: await instance.apiInfo.getApi(),
    };

    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getSonarrConfig = async (ctx: Context) => {
  const {
    withPaths,
    withProfiles,
    withLanguages,
    withAvailabilities,
    withTags,
  } = ctx.request.query;

  const downloaders = await getInstances(DownloaderType.SONARR);

  const results = await bluebird.map(downloaders, async (downloader) => {
    const { instance, client } = downloader;
    const [paths, profiles, languages, availabilities, tags] =
      await Promise.all([
        withPaths ? client.rootFolder.getApiV3Rootfolder() : undefined,
        withProfiles
          ? client.qualityProfile.getApiV3Qualityprofile()
          : undefined,
        withLanguages ? client.language.getApiV3Language() : undefined,
        withAvailabilities ? SonarrAvailabilities : undefined,
        withTags ? client.tag.getApiV3Tag() : undefined,
      ]);

    const url = new URL(instance.url);
    return {
      id: instance.id,
      name: instance.name,
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port,
      subpath: url.pathname,
      token: instance.token,
      profile: instance.metadata.profile,
      path: instance.metadata.path,
      language: instance.metadata.language,
      availability: instance.metadata.availability,
      enabled: instance.enabled,
      paths,
      profiles,
      languages,
      availabilities,
      tags,
    };
  });

  ctx.status = StatusCodes.OK;
  ctx.body = results;
};

const updateSonarrConfig = async (ctx: Context) => {
  const instance = ctx.request.body as ArrInput;

  try {
    if (instance.subpath.startsWith('/')) {
      instance.subpath = instance.subpath.substring(1);
    }

    const url = new URL(
      `${instance.protocol}://${instance.host}:${instance.port}/${instance.subpath}`,
    );

    const api = new SonarrV3Client({
      BASE: url.toString(),
      HEADERS: {
        'x-api-key': instance.token,
      },
    });
    const status = await api.system.getApiV3SystemStatus();

    const entity = DownloaderEntity.create({
      name: instance.name,
      type: DownloaderType.SONARR,
      url: url.toString(),
      token: instance.token,
      enabled: instance.enabled,
      metadata: {
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        availability: instance.availability,
        version: status.version,
      },
    });

    const existingInstance = await getFromContainer(
      DownloaderRepository,
    ).findOne({
      id: instance.id,
    });
    if (existingInstance.isNone()) {
      await getFromContainer(DownloaderRepository).create(entity);
    } else {
      const currentInstance = existingInstance.unwrap();
      await getFromContainer(DownloaderRepository).updateMany(
        { id: currentInstance.id },
        {
          name: entity.name,
          url: entity.url,
          token: entity.token,
          enabled: entity.enabled,
          metadata: entity.metadata,
        },
      );
    }

    ctx.status = StatusCodes.OK;
    ctx.body = getFromContainer(DownloaderMapper).toResponse(entity);
    return;
  } catch (error) {
    logger.debug(`ROUTE: Error saving sonarr config`, error);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const deleteSonarrById = async (ctx: Context) => {
  try {
    const deleted = await getFromContainer(
      DownloaderRepository,
    ).deleteManyByIds([ctx.params.id]);
    if (!deleted) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = `failed to delete instance with the id: ${ctx.params.id}`;
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
  const instances = await getFromContainer(DownloaderRepository).findAll();
  if (!instances.length) {
    ctx.success({
      statusCode: StatusCodes.OK,
      data: [],
    });
    return;
  }

  const now = new Date();
  const calendarData = await bluebird.map(instances, async (instance) => {
    const url = new URL(instance.url);
    const api =
      instance.type === DownloaderType.SONARR
        ? new SonarrV3Client({
            BASE: url.toString(),
            HEADERS: {
              'x-api-key': instance.token,
            },
          })
        : new RadarrV3Client({
            BASE: url.toString(),
            HEADERS: {
              'x-api-key': instance.token,
            },
          });

    return api.calendar.getApiV3Calendar({
      unmonitored: true,
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString(),
    });
  });

  ctx.success({
    statusCode: StatusCodes.OK,
    data: calendarData.flat(),
  });
};

const getRadarrOptionsById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.RADARR);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const [paths, profiles, languages, tags, minimumAvailability] =
      await Promise.all([
        instance.rootFolder.getApiV3Rootfolder(),
        instance.qualityProfile.getApiV3Qualityprofile(),
        instance.language.getApiV3Language(),
        instance.tag.getApiV3Tag(),
        RadarrAvailabilities,
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
    const instance = await getInstance(ctx.params.id, DownloaderType.RADARR);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    ctx.status = StatusCodes.OK;
    ctx.body = await instance.rootFolder.getApiV3Rootfolder();
  } catch (error) {
    logger.error(error.stack);

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrProfilesById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.RADARR);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const profiles = await instance.qualityProfile.getApiV3Qualityprofile();

    ctx.status = StatusCodes.OK;
    ctx.body = profiles;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrLanguagesById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.RADARR);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const languages = await instance.language.getApiV3Language();

    ctx.status = StatusCodes.OK;
    ctx.body = languages;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const getRadarrTagsById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.RADARR);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const tags = await instance.tag.getApiV3Tag();

    ctx.status = StatusCodes.OK;
    ctx.body = tags;
  } catch (error) {
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = error.message;
  }
};

const testRadarrConnectionById = async (ctx: Context) => {
  try {
    const instance = await getInstance(ctx.params.id, DownloaderType.RADARR);
    if (!instance) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = 'no instance could be found with that id';
      return;
    }

    const test = await instance.system.getApiV3SystemStatus();
    const data = {
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
  const {
    withPaths,
    withProfiles,
    withLanguages,
    withAvailabilities,
    withTags,
  } = ctx.request.query;

  const downloaders = await getInstances(DownloaderType.RADARR);

  const results = await bluebird.map(downloaders, async (downloader) => {
    const { instance, client } = downloader;
    const [paths, profiles, languages, availabilities, tags] =
      await Promise.all([
        withPaths ? client.rootFolder.getApiV3Rootfolder() : undefined,
        withProfiles
          ? client.qualityProfile.getApiV3Qualityprofile()
          : undefined,
        withLanguages ? client.language.getApiV3Language() : undefined,
        withAvailabilities ? SonarrAvailabilities : undefined,
        withTags ? client.tag.getApiV3Tag() : undefined,
      ]);

    const url = new URL(instance.url);
    return {
      id: instance.id,
      name: instance.name,
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port,
      subpath: url.pathname,
      token: instance.token,
      profile: instance.metadata.profile,
      path: instance.metadata.path,
      language: instance.metadata.language,
      availability: instance.metadata.availability,
      enabled: instance.enabled,
      paths,
      profiles,
      languages,
      availabilities,
      tags,
    };
  });

  ctx.status = StatusCodes.OK;
  ctx.body = results;
};

const updateRadarrConfig = async (ctx: Context) => {
  const instance = ctx.request.body as ArrInput;

  try {
    if (instance.subpath.startsWith('/')) {
      instance.subpath = instance.subpath.substring(1);
    }

    const url = new URL(
      `${instance.protocol}://${instance.host}:${instance.port}/${instance.subpath}`,
    );

    const api = new RadarrV3Client({
      BASE: url.toString(),
      HEADERS: {
        'x-api-key': instance.token,
      },
    });
    const status = await api.system.getApiV3SystemStatus();

    const entity = DownloaderEntity.create({
      name: instance.name,
      type: DownloaderType.RADARR,
      url: url.toString(),
      token: instance.token,
      enabled: instance.enabled,
      metadata: {
        path: instance.path,
        profile: instance.profile,
        language: instance.language,
        availability: instance.availability,
        version: status.version,
      },
    });

    const existingInstance = await getFromContainer(
      DownloaderRepository,
    ).findOne({
      id: instance.id,
    });
    if (existingInstance.isNone()) {
      await getFromContainer(DownloaderRepository).create(entity);
    } else {
      const currentInstance = existingInstance.unwrap();
      await getFromContainer(DownloaderRepository).updateMany(
        { id: currentInstance.id },
        {
          name: entity.name,
          url: entity.url,
          token: entity.token,
          enabled: entity.enabled,
          metadata: entity.metadata,
        },
      );
    }

    ctx.status = StatusCodes.OK;
    ctx.body = getFromContainer(DownloaderMapper).toResponse(entity);
    return;
  } catch (error) {
    logger.debug(`ROUTE: Error saving radarr config`, error);
    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const deleteRadarrById = async (ctx: Context) => {
  try {
    const deleted = await getFromContainer(
      DownloaderRepository,
    ).deleteManyByIds(ctx.params.id);
    if (!deleted) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = `failed to delete instance with the id: ${ctx.params.id}`;
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

const route = new Router({ prefix: '/services' });
export default (app: Router) => {
  route.get(
    '/sonarr/options/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getSonarrOptionsById,
  );
  route.get(
    '/sonarr/paths/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getSonarrPathsById,
  );
  route.get(
    '/sonarr/profiles/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getSonarrProfilesById,
  );
  route.get(
    '/sonarr/languages/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getSonarrLanguagesById,
  );
  route.get(
    '/sonarr/tags/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getSonarrTagsById,
  );
  route.get(
    '/sonarr/test/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    testSonarrConnectionById,
  );
  route.get(
    '/sonarr/config',
    validateRequest({
      query: z.object({
        withPaths: z.any().optional(),
        withProfiles: z.any().optional(),
        withLanguages: z.any().optional(),
        withAvailabilities: z.any().optional(),
        withTags: z.any().optional(),
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
        id: z.string(),
      }),
    }),
    adminRequired,
    deleteSonarrById,
  );
  route.get(
    '/radarr/options/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getRadarrOptionsById,
  );
  route.get(
    '/radarr/paths/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getRadarrPathsById,
  );
  route.get(
    '/radarr/profiles/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getRadarrProfilesById,
  );
  route.get(
    '/radarr/languages/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getRadarrLanguagesById,
  );
  route.get(
    '/radarr/tags/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    getRadarrTagsById,
  );
  route.get(
    '/radarr/test/:id',
    validateRequest({
      params: z.object({
        id: z.string(),
      }),
    }),
    adminRequired,
    testRadarrConnectionById,
  );
  route.get(
    '/radarr/config',
    validateRequest({
      query: z.object({
        withPaths: z.any().optional(),
        withProfiles: z.any().optional(),
        withLanguages: z.any().optional(),
        withAvailabilities: z.any().optional(),
        withTags: z.any().optional(),
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
        id: z.string(),
      }),
    }),
    adminRequired,
    deleteRadarrById,
  );

  app.use(route.routes());
};
