import { Routing } from "express-zod-api";
import { getMovieComingSoonEndpoint } from "./movie/comingsoon";
import { getTVComingSoonEndpoint } from "./tv/comingsoon";

export const routing: Routing = {
  api: {
    v1: {
      movie: {
        comingsoon: getMovieComingSoonEndpoint,
        popular: {},
        trending: {},
        ":id": {},
      },
      tv: {
        comingsoon: getTVComingSoonEndpoint,
        popular: {},
        trending: {},
        ":id": {},
      },
    },
  },
};
