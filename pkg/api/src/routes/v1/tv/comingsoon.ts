import { z, defaultEndpointsFactory } from "express-zod-api";
import { TMDBAPI } from "../../../tmdb/tmdb";
import { TVResultSchema } from "../../../tmdb/discover/tv/schema";
import { SortByType } from "@root/tmdb/discover/tv/types";

export const getTVComingSoonEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    language: z.string().default("en-US"),
    timezone: z.string().default("America/New_York"),
    sort_by: z.nativeEnum(SortByType).default(SortByType.PopularityDESC),
  }),
  output: z.object({
    tv: z.array(TVResultSchema),
  }),
  handler: async ({ input }) => {
    const tv = await TMDBAPI.get("/discover/tv", { queries: input });
    return { tv: tv.results };
  },
});
