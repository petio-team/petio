/* eslint-disable import/order */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { isErrorFromPath } from '@zodios/core';

import { config } from '@/config';
import loggerMain from '@/infra/logger/logger';
import { PlexAPIClient, PlexApiEndpoints } from '@/infra/plex/plex';
import plexLookup from '@/services/plex/lookup';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

import cache from '../cache/cache';

const logger = loggerMain.child({ module: 'plex.history' });

export default async (id, type) => {
  let data: any = false;
  try {
    data = await cache.wrap(`hist__${id}__${type}`, async () => {
      const history = await getHistory(id);
      return parseHistory(history, type);
    });
  } catch (err) {
    logger.error(`Error getting history data - ${id}`, err);
    return [];
  }
  return data;
};

async function getHistory(id: string, library?: number) {
  const baseurl = `${config.get('plex.protocol')}://${config.get(
    'plex.host',
  )}:${config.get('plex.port')}`;
  const client = PlexAPIClient(baseurl, config.get('plex.token'));
  try {
    // const d = new Date();
    // d.setDate(0);
    // d.setMonth(d.getMonth() - 6);
    // const time = d.getTime();
    // console.log(`history time: ${d.toISOString()}`);

    const content = await client.get('/status/sessions/history/all', {
      queries: {
        accountID: id,
        sort: 'viewedAt:desc',
        // 'viewedAt>': time,
        librarySectionID: library,
      },
    });
    return content;
  } catch (err) {
    if (
      !isErrorFromPath(
        PlexApiEndpoints,
        'get',
        '/status/sessions/history/all',
        err,
      )
    ) {
      logger.error(`Failed to get history from Plex`, err);
    }
    return null;
  }
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
