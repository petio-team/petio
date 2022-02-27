import { z } from "express-zod-api";

export enum ComingSoonType {
  Show = "Show",
  Movie = "Movie",
}

export const VideoSchema = z.object({
  title: z.string(),
  key: z.string(),
});
export type Video = z.infer<typeof VideoSchema>;

export const ComingSoonSchema = z.object({
  type: z.nativeEnum(ComingSoonType),
  id: z.number(),
  available: z.boolean(),
  title: z.string(),
  posterPath: z.string(),
  date: z.string(),
  videos: z.array(VideoSchema),
});
export type ComingSoon = z.infer<typeof ComingSoonSchema>;
