import { z } from 'zod';

export const VideoResultSchema = z.object({
  iso_639_1: z.string(),
  iso_3166_1: z.string(),
  name: z.string(),
  key: z.string(),
  site: z.string(),
  size: z.number(),
  type: z.string(),
  official: z.boolean(),
  published_at: z.string(),
  id: z.string(),
});
export type VideoResult = z.infer<typeof VideoResultSchema>;

export const VideoSchema = z.object({
  id: z.number(),
  results: z.array(VideoResultSchema),
});
export type Video = z.infer<typeof VideoSchema>;
