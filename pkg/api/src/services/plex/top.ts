/* eslint-disable @typescript-eslint/no-use-before-define */
import { fromError, isValidationError } from 'zod-validation-error';

import { config } from '@/config';
import loggerMain from '@/infra/logger/logger';
import { PlexAPIClient } from '@/infra/plex/plex';
import { MediaContainer } from '@/infra/plex/plex/library';
import plexLookup from '@/services/plex/lookup';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';
import is from '@/utils/is';

// eslint-disable-next-line import/order
import cache from '../cache/cache';

const logger = loggerMain.child({ module: 'plex.top' });
export default async (type: 1 | 2) => {
  try {
    return await cache.wrap(`popular__${type}`, async () => getTopData(type));
  } catch (err) {
    logger.error(`Error getting top data - ${type}`, err);
    return {};
  }
};

async function getTopData(type: 1 | 2) {
  const baseurl = `${config.get('plex.protocol')}://${config.get(
    'plex.host',
  )}:${config.get('plex.port')}`;
  const client = PlexAPIClient(baseurl, config.get('plex.token'));

  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  const timestamp = d.getTime() / 1000 || 0;

  try {
    const data = await client.get('/library/all/top', {
      queries: {
        type,
        'viewedAt>': timestamp,
        limit: 20,
      },
    });
    if (!data.MediaContainer.Metadata) {
      return {};
    }
    return await parseTop(data, type);
  } catch (err) {
    if (isValidationError(err)) {
      const zodError = fromError(err);
      logger.error(zodError, 'Error getting top data');
      return {};
    }
    logger.debug(err, 'Error getting top data');
    return {};
  }
}

async function parseTop(
  data: MediaContainer,
  type: number,
): Promise<{ [key: string]: any }> {
  const top = data.MediaContainer.Metadata;
  if (!top) {
    logger.debug(
      "No Plex Top Data, you're probably not a Plex Pass user. This is not an error",
    );
    return {};
  }
  const promises = top.map(async (item: { ratingKey: any }) => {
    const { ratingKey } = item;
    let plexData: any = false;
    if (type === 2) {
      plexData = await plexLookup(ratingKey, 'show');
    } else {
      plexData = await plexLookup(ratingKey, 'movie');
    }
    if (plexData.tmdb_id) {
      const rt =
        type === 2
          ? await showLookup(plexData.tmdb_id, true)
          : await movieLookup(plexData.tmdb_id, true);
      return { [plexData.tmdb_id]: rt };
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
