import { Routing, DependsOnMethod } from "express-zod-api";
import { comingSoonMovieEndpoint } from "./discovery/movie/comingsoon";
import { comingSoonTVEndpoint } from "./discovery/tv/comingsoon";

export const routing: Routing = {
  api: {
    v1: {
      discovery: {
        movie: {
          comingsoon: new DependsOnMethod({
            get: comingSoonMovieEndpoint,
          }),
        },
        tv: {
          comingsoon: new DependsOnMethod({
            get: comingSoonTVEndpoint,
          }),
        },
      },
    },
  },
};
