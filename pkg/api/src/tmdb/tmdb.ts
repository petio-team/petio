import { Zodios } from "zodios";

import { tmdbApiKey } from "../app/env";
import { DiscoverAPI } from "./discover/discover";
import { pluginApiKey } from "./key";
import { MovieAPI } from "./movie/movies";
import { TrendingAPI } from "./trending/trending";
import { TVAPI } from "./tv/tv";

export const TMDBAPI = new Zodios("https://api.themoviedb.org/3", [
  ...DiscoverAPI,
  ...MovieAPI,
  ...TVAPI,
  ...TrendingAPI,
] as const);

TMDBAPI.use(
  pluginApiKey({
    getApiKey: async () => tmdbApiKey,
  })
);
