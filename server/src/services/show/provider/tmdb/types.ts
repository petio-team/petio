import {
  TvSeriesContentRatingsResponse,
  TvSeriesCreditsResponse,
  TvSeriesDetailsResponse,
  TvSeriesExternalIdsResponse,
  TvSeriesImagesResponse,
  TvSeriesKeywordsResponse,
  TvSeriesRecommendationsResponse,
  TvSeriesSimilarResponse,
  TvSeriesVideosResponse,
} from '@/infrastructure/tmdb/client';

export type ShowDetailsProviderResponse = TvSeriesDetailsResponse & {
  videos?: Omit<TvSeriesVideosResponse, 'id'>;
  keywords?: Omit<TvSeriesKeywordsResponse, 'id'>;
  credits?: Omit<TvSeriesCreditsResponse, 'id'>;
  content_ratings?: Omit<TvSeriesContentRatingsResponse, 'id'>;
  images?: Omit<TvSeriesImagesResponse, 'id'>;
  recommendations?: TvSeriesRecommendationsResponse;
  similar?: TvSeriesSimilarResponse;
  external_ids?: Omit<TvSeriesExternalIdsResponse, 'id'>;
};
