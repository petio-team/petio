import { z, defaultEndpointsFactory, createHttpError } from "express-zod-api";
import { TMDBAPI } from "../../../tmdb/tmdb";
import { ComingSoonSchema, ComingSoon } from "@models/comingsoon/model";
import { SortByType } from "@root/tmdb/discover/tv/types";
import onServer from "@root/plex/server";
import dayjs from "dayjs";

export const getTVComingSoonEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    language: z.string().default("en-US"),
    timezone: z.string().default("America/New_York"),
    sort_by: z.nativeEnum(SortByType).default(SortByType.PopularityDESC),
    with_original_language: z.string().default("en"),
  }),
  output: z.object({
    shows: z.array(ComingSoonSchema),
  }),
  handler: async ({ input }) => {
    const shows = await TMDBAPI.get("/discover/tv", {
      queries: {
        ...input,
        "first_air_date.gte": dayjs().format("YYYY-MM-DD").toString(),
        include_null_first_air_dates: false,
      },
    });

    const output: ComingSoon[] = await Promise.all(
      shows.results.map(async (show) => {
        const plex = await onServer("show", false, false, show.id);
        return {
          id: show.id,
          available: !!plex?.exists ? true : false,
          title: show.name,
          posterPath: !!show?.poster_path ? show.poster_path : "",
          date: !!show?.first_air_date
            ? dayjs(show.first_air_date).format("YYYY-MM-DD").toString()
            : "",
        };
      })
    );

    return { shows: output };
  },
});
