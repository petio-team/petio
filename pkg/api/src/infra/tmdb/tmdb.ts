import { Zodios } from '@zodios/core';

import { pluginQuery } from '@/utils/zodios';

import { TMDB_API_KEY } from '../config/env';
import { DiscoverAPI } from './discover/discover';
import { MovieAPI } from './movie/movies';
import { TrendingAPI } from './trending/trending';
import { TVAPI } from './tv/tv';

export const TMDBAPI = new Zodios('https://api.themoviedb.org/3', [
  ...DiscoverAPI,
  ...MovieAPI,
  ...TVAPI,
  ...TrendingAPI,
]);
TMDBAPI.use(pluginQuery('api_key', async () => TMDB_API_KEY));
