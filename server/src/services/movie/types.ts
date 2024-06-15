export const TmdbImageBaseUrl = 'https://image.tmdb.org/t/p/original';

export const DefaultFanartMovieImage =
  'http://assets.fanart.tv/fanart/tv/0/hdtvlogo/-60a02798b7eea.png';

/**
 * Options for looking up a movie.
 */
export type MovieLookupOptions = {
  withServer?: boolean;
  withArtwork?: boolean;
  withRating?: boolean;
};

/**
 * Represents the options for discovering movies.
 */
export type MovieDiscoverOptions = {
  page?: number;
  limit?: number;
  filterByCompanyId?: number;
};
