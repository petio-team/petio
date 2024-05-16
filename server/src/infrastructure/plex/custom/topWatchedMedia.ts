import { CancelablePromise, PlexClient } from '@/infrastructure/plex';
import { request } from '@/infrastructure/plex/core/request';

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
export const getTopWatchedMedia = (
  client: PlexClient,
  data: GetLibraryTopContentParams,
): CancelablePromise<GetLibraryTopContentResponse> =>
  request(client.request.config, {
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
