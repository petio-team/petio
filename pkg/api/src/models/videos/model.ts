import { z } from "express-zod-api";

export const VideoSchema = z.object({
  title: z.string(),
  key: z.string(),
});
export type Video = z.infer<typeof VideoSchema>;
