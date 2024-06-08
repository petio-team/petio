/* eslint-disable @typescript-eslint/no-use-before-define */
import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import { CancelablePromise, PlexClient } from '@/infrastructure/plex';
import is from '@/infrastructure/utils/is';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { CacheProvider } from '@/services/cache/cache-provider';
import { getPlexClient } from '@/services/plex/client';
import { movieDbLookup, showDbLookup } from '@/services/plex/lookup';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const logger = loggerMain.child({ module: 'plex.top' });

export type GetLibraryTopContentResponse = {
  MediaContainer?: {
    size?: number;
    allowSync?: boolean;
    identifier?: string;
    mediaTagPrefix?: string;
    mediaTagVersion?: number;
    Metadata?: Array<{
      ratingKey?: string;
      key?: string;
      guid?: string;
      slug?: string;
      studio?: string;
      type?: string;
      title?: string;
      librarySectionTitle?: string;
      librarySectionID?: number;
      librarySectionKey?: string;
      contentRating?: string;
      summary?: string;
      index?: number;
      audienceRating?: number;
      year?: number;
      thumb?: string;
      art?: string;
      theme?: string;
      duration?: number;
      originallyAvailableAt?: string;
      leafCount?: number;
      viewedLeafCount?: number;
      childCount?: number;
      addedAt?: number;
      updatedAt?: number;
      globalViewCount?: number;
      userCount?: number;
      audienceRatingImage?: string;
      Genre?: Array<{
        tag?: string;
      }>;
      Country?: Array<{
        tag?: string;
      }>;
      Role?: Array<{
        tag?: string;
      }>;
      User?: Array<{
        id?: number;
      }>;
      originalTitle?: string;
      titleSort?: string;
      primaryExtraKey?: string;
      tagline?: string;
      seasonCount?: number;
    }>;
  };
};

export type GetLibraryTopContentParams = {
  type: number;
  accountId?: string;
  'viewedAt>'?: number;
  limit?: number;
};

/**
 * Get Top Watched Content From Libraries
 */
export const getTopWatched = (
  client: PlexClient,
  data: GetLibraryTopContentParams,
): CancelablePromise<GetLibraryTopContentResponse> =>
  client.request.request({
    method: 'GET',
    url: '/library/all/top',
    query: {
      type: data.type,
      'viewedAt>': data['viewedAt>'],
      limit: data.limit,
    },
    errors: {
      400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
      401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
    },
  });

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
    const data = await getTopWatched(client, {
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
