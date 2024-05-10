/* eslint-disable @typescript-eslint/no-use-before-define */
import Bluebird from 'bluebird';

import { getFromContainer } from '@/infra/container/container';
import loggerMain from '@/infra/logger/logger';
import { GetSessionHistoryResponse, PlexClient } from '@/infra/plex';
import { CacheService } from '@/services/cache/cache';
import plexLookup from '@/services/plex/lookup';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';
import is from '@/utils/is';

const logger = loggerMain.child({ module: 'plex.history' });

export default async (client: PlexClient, id, type) => {
  let data: any = false;
  try {
    data = await getFromContainer(CacheService).wrap(
      `hist__${id}__${type}`,
      async () => {
        const history = await getHistory(client, id);
        if (history) {
          return parseHistory(history, type);
        }
        return {};
      },
    );
  } catch (err) {
    logger.error(err, `Error getting history data - ${id}`);
    return [];
  }
  return data;
};

async function getHistory(client: PlexClient, id: string, library?: number) {
  try {
    const d = new Date();
    const m = d.getMonth();
    d.setDate(0);
    d.setMonth(d.getMonth() - 1);
    if (d.getMonth() === m) {
      d.setDate(0);
    }
    d.setHours(0, 0, 0, 0);
    const time = d.getTime();

    const content = await client.sessions.getSessionHistory({
      accountId: id,
      sort: 'viewedAt:desc',
      'viewedAt>': time,
      librarySectionID: library,
    });
    return content;
  } catch (err) {
    logger.error(err, 'Error getting history data');
    return null;
  }
}

async function parseHistory(data: GetSessionHistoryResponse, historyType) {
  if (!is.truthy(data.MediaContainer)) {
    return {};
  }
  let type = historyType;
  if (type === 'show') {
    type = 'episode';
  }
  const history = data.MediaContainer.Metadata;
  if (!history) {
    return {};
  }
  const histArr: any = [];
  const items: any = [];
  await Bluebird.map(history, async (item) => {
    if (type === item.type || type === 'all') {
      const mediaType = item.type;
      let mediaId = item.ratingKey;

      if (mediaType === 'episode' && item.grandparentKey) {
        mediaId = item.grandparentKey.replace('/library/metadata/', '');
      } else if (mediaType === 'episode' && item.parentKey) {
        mediaId = item.parentKey.replace('/library/metadata/', '');
      }

      const key = mediaId;

      if (!histArr.includes(key)) {
        if (mediaType === 'episode') {
          const plexData: any = await plexLookup(mediaId, 'show');
          mediaId = plexData.tmdb_id;
        } else {
          const plexData: any = await plexLookup(mediaId, 'movie');
          mediaId = plexData.tmdb_id;
        }

        histArr.push(key);

        if (mediaType === type || type === 'all')
          items.push({
            mediaId,
            mediaType,
          });
      }
    }
  });

  const output = await Promise.all(
    items.map(async (item) => {
      const lookup =
        item.mediaType === 'movie'
          ? movieLookup(item.mediaId, false)
          : showLookup(item.mediaId, false);
      return lookup;
    }),
  );

  output.length = 21;
  return output;
}
