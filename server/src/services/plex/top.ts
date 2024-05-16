/* eslint-disable @typescript-eslint/no-use-before-define */
import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import {
  GetLibraryTopContentResponse,
  getTopWatchedMedia,
} from '@/infrastructure/plex/custom/topWatchedMedia';
import is from '@/infrastructure/utils/is';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { CacheService } from '@/services/cache/cache';
import { getPlexClient } from '@/services/plex/client';
import { movieDbLookup, showDbLookup } from '@/services/plex/lookup';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const logger = loggerMain.child({ module: 'plex.top' });

export default async (server: MediaServerEntity, type: 1 | 2) => {
  try {
    return await getFromContainer(CacheService).wrap(
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
    const data = await getTopWatchedMedia(client, {
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
      if (plexData.tmdb_id) {
        return { [plexData.tmdb_id]: await showLookup(plexData.tmdb_id, true) };
      }
    } else {
      const plexData = await movieDbLookup(ratingKey);
      if (is.falsy(plexData)) {
        return {};
      }
      if (plexData.tmdb_id) {
        return {
          [plexData.tmdb_id]: await movieLookup(plexData.tmdb_id, true),
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
