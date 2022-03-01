import { z } from "express-zod-api";

export const ComingSoonSchema = z.object({
  id: z.number(),
  available: z.boolean(),
  title: z.string(),
  posterPath: z.string(),
  date: z.string(),
});
export type ComingSoon = z.infer<typeof ComingSoonSchema>;
