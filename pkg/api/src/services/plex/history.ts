import request from 'xhr-request';

import cache from "../cache/cache";
import logger from '@/loaders/logger';
import plexLookup from '@/services/plex/lookup';
import MakePlexURL from '@/services/plex/util';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

export default async (id, type) => {
  let data: any = false;
  try {
    data = await cache.wrap(`hist__${id}__${type}`, () =>
      getHistoryData(id, type),
    );
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
  if (!history) {
    return {};
  }
  const histArr: any = [];
  const items: any = [];
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

        if (media_type === type || type === 'all')
          items.push({
            media_id,
            media_type,
          });
      }
    }
  }

  const output = await Promise.all(
    items.map(async (item) => {
      const lookup =
        item.media_type === 'movie'
          ? movieLookup(item.media_id, false)
          : showLookup(item.media_id, false);
      return lookup;
    }),
  );

  output.length = 21;
  return output;
}
