import { z } from 'zod';

export const TVResultSchema = z.object({
  backdrop_path: z.union([z.string(), z.null()]),
  first_air_date: z.union([z.string(), z.undefined()]),
  genre_ids: z.array(z.number()),
  id: z.number(),
  name: z.string(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.union([z.string(), z.null()]),
  vote_average: z.number(),
  vote_count: z.number(),
});
export type TVResult = z.infer<typeof TVResultSchema>;

export const TVSchema = z.object({
  page: z.number(),
  results: z.array(TVResultSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type TV = z.infer<typeof TVSchema>;
