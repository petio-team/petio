import { z, defaultEndpointsFactory } from "express-zod-api";
import { SortByType } from "../../../tmdb/discover/types";
import { TMDBAPI } from "../../../tmdb/tmdb";
import { TVResultSchema } from "../../../tmdb/discover/tv/schema";

export const getTVComingSoonEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    language: z.string().default("en-US"),
    timezone: z.string().default("America/New_York").optional(),
    sort_by: z.nativeEnum(SortByType).default(SortByType["popularity.desc"]),
  }),
  output: z.object({
    tv: z.array(TVResultSchema),
  }),
  handler: async ({ input }) => {
    const tv = await TMDBAPI.get("/discover/tv", { queries: input });
    return { tv: tv.results };
  },
});
