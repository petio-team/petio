import { z, defaultEndpointsFactory } from "express-zod-api";
import { SortByType } from "../../../tmdb/discover/types";
import { TMDBAPI } from "../../../tmdb/tmdb";
import { MovieResultSchema } from "../../../tmdb/discover/movie/schema";

export const getMovieComingSoonEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    language: z.string().default("en-US"),
    region: z.string().optional(),
    sort_by: z.nativeEnum(SortByType).default(SortByType["popularity.desc"]),
  }),
  output: z.object({
    movies: z.array(MovieResultSchema),
  }),
  handler: async ({ input }) => {
    const movies = await TMDBAPI.get("/discover/movie", { queries: input });
    return { movies: movies.results };
  },
});
