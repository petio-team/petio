import { TMDBAPI } from "@root/tmdb/tmdb";
import { z, defaultEndpointsFactory } from "express-zod-api";
import { VideoSchema, Video } from "@models/videos/model";

export const getTVVideosEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  output: z.object({
    videos: z.array(VideoSchema),
  }),
  handler: async ({ input }) => {
    const videos = await TMDBAPI.get("/tv/:id/videos", {
      params: { id: input.id },
    });

    const output: Video[] = videos.results
      .filter(
        (video) =>
          video.site === "YouTube" &&
          (video.type === "Trailer" || video.type === "Teaser")
      )
      .map((video) => {
        return {
          title: video.name,
          key: video.key,
        };
      });

    return { videos: output };
  },
});
