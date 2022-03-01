import { z, defaultEndpointsFactory } from "express-zod-api";
import { SortByType } from "../../../tmdb/discover/movie/types";
import { TMDBAPI } from "../../../tmdb/tmdb";
import { ComingSoonSchema, ComingSoon } from "@models/comingsoon/model";
import onServer from "@root/plex/onServer";
import dayjs from "dayjs";

export const getMovieComingSoonEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    language: z.string().default("en-US"),
    region: z.string().optional(),
    sort_by: z.nativeEnum(SortByType).default(SortByType.PopularityDESC),
  }),
  output: z.object({
    movies: z.array(ComingSoonSchema),
  }),
  handler: async ({ input }) => {
    const movies = await TMDBAPI.get("/discover/movie", {
      queries: {
        ...input,
        "primary_release_date.gte": dayjs().format("YYYY-MM-DD").toString(),
      },
    });

    const output: ComingSoon[] = await Promise.all(
      movies.results.map(async (movie) => {
        const plex = await onServer("movie", false, false, movie.id);
        return {
          id: movie.id,
          available: !!plex?.exists ? true : false,
          title: movie.title,
          posterPath: !!movie?.poster_path ? movie.poster_path : "",
          date: movie.release_date,
        };
      })
    );

    return { movies: output };
  },
});
