/**
 * Options for getting a show.
 */
export type GetShowOptions = {
  withServer?: boolean;
  withArtwork?: boolean;
};

/**
 * Options for discovering shows.
 */
export type DiscoverShowsOptions = {
  page?: number;
  limit?: number;
  filterByNetworkId?: number;
  filterByGenreId?: number;
};
