/* eslint-disable @typescript-eslint/no-use-before-define */
import { getFromContainer } from '@/infrastructure/container/container';
import { GetLibraryTopContentResponse } from '@/infrastructure/generated/custom/plex-api-client/types';
import loggerMain from '@/infrastructure/logger/logger';
import is from '@/infrastructure/utils/is';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { CacheProvider } from '@/services/cache/cache-provider';
import { getPlexClient } from '@/services/plex/client';
import { movieDbLookup, showDbLookup } from '@/services/plex/lookup';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const logger = loggerMain.child({ module: 'plex.top' });

export default async (server: MediaServerEntity, type: 1 | 2) => {
  try {
    return await getFromContainer(CacheProvider).wrap(
      `popular__${type}`,
      async () => getTopData(server, type),
    );
  } catch (err) {
    logger.error(`Error getting top data - ${type}`, err);
    return {};
  }
};

async function getTopData(server: MediaServerEntity, type: 1 | 2) {
  const client = getPlexClient(server);

  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  const timestamp = d.getTime() / 1000 || 0;

  try {
    const data = await client.getLibraryTopWatched({
      type,
      limit: 20,
      'viewedAt>': timestamp,
    });
    if (
      !is.truthy(data.MediaContainer) ||
      !is.truthy(data.MediaContainer.Metadata)
    ) {
      return {};
    }
    return await parseTop(data.MediaContainer, type);
  } catch (err) {
    logger.debug(err, 'Error getting top data');
    return {};
  }
}

async function parseTop(
  data: GetLibraryTopContentResponse['MediaContainer'],
  type: number,
): Promise<{ [key: string]: any }> {
  if (!is.truthy(data) || !is.truthy(data.Metadata)) {
    return {};
  }
  const top = data.Metadata;
  if (!top) {
    logger.debug(
      "No Plex Top Data, you're probably not a Plex Pass user. This is not an error",
    );
    return {};
  }
  const promises = top.map(async (item: { ratingKey: any }) => {
    const { ratingKey } = item;
    if (type === 2) {
      const plexData = await showDbLookup(ratingKey);
      if (is.falsy(plexData)) {
        return {};
      }
      if (plexData.providers.tmdb) {
        return {
          [plexData.providers.tmdb]: await showLookup(
            plexData.providers.tmdb,
            true,
          ),
        };
      }
    } else {
      const plexData = await movieDbLookup(ratingKey);
      if (is.falsy(plexData)) {
        return {};
      }
      if (plexData.providers.tmdb) {
        return {
          [`${plexData.providers.tmdb}`]: await movieLookup(
            plexData.providers.tmdb,
            true,
          ),
        };
      }
    }
    return null;
  });
  const results = await Promise.all(promises);
  const mergedResults = results.filter(is.truthy).reduce((acc, item) => {
    if (item) {
      const key = Object.keys(item)[0];
      acc[key] = item[key];
    }
    return acc;
  }, {});
  return mergedResults;
}
