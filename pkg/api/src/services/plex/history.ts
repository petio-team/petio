import cacheManager from 'cache-manager';
import request from 'xhr-request';

import logger from '@/loaders/logger';
import plexLookup from '@/services/plex/lookup';
import MakePlexURL from '@/services/plex/util';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 500,
  ttl: 3600 /* seconds */,
});

export default async (id, type) => {
  let data: any = false;
  try {
    data = await memoryCache.wrap(`hist__${id}__${type}`, () => getHistoryData(id, type));
  } catch (err) {
    logger.warn(`Error getting history data - ${id}`, {
      label: 'plex.history',
    });
    logger.error(err, { label: 'plex.history' });
    return [];
  }
  return data;
};

function getHistoryData(id, type) {
  logger.verbose('History returned from source', { label: 'plex.history' });
  return new Promise((resolve, reject) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setHours(0, 0, 0);
    d.setMilliseconds(0);

    const url = MakePlexURL('status/sessions/history/all', {
      sort: 'viewedAt:desc',
      accountID: id,
      'viewedAt>=': '0',
      'X-Plex-Container-Start': 0,
      'X-Plex-Container-Size': 100,
    }).toString();

    request(
      url,
      {
        method: 'GET',
        json: true,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        if (!data) {
          resolve({});
        } else {
          resolve(parseHistory(data, type));
        }
      },
    );
  });
}

async function parseHistory(data, type) {
  if (type === 'show') {
    type = 'episode';
  }
  const history = data.MediaContainer.Metadata;
  const output = {};
  if (!history) {
    return output;
  }
  const histArr: any = [];
  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    if (type === item.type || type === 'all') {
      const media_type = item.type;
      let media_id = item.ratingKey;

      if (media_type === 'episode' && item.grandparentKey) {
        media_id = item.grandparentKey.replace('/library/metadata/', '');
      } else if (media_type === 'episode' && item.parentKey) {
        media_id = item.parentKey.replace('/library/metadata/', '');
      }

      const key = media_id;

      if (!histArr.includes(key)) {
        if (media_type === 'episode') {
          const plexData: any = await plexLookup(media_id, 'show');
          media_id = plexData.tmdb_id;
        } else {
          const plexData: any = await plexLookup(media_id, 'movie');
          media_id = plexData.tmdb_id;
        }

        histArr.push(key);

        if (
          (media_type === type || type === 'all') &&
          Object.keys(output).length < 19
        ) {
          output[i] =
            media_type === 'movie'
              ? movieLookup(media_id, false)
              : showLookup(media_id, false);
        }
      }


    }
  }
  return output;
}
