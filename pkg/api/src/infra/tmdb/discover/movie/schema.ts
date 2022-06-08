import { z } from "zod";

export const MovieResultSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.union([z.string(), z.null()]),
  genre_ids: z.array(z.number()),
  id: z.number(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.union([z.string(), z.null()]),
  release_date: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});
export type MovieResult = z.infer<typeof MovieResultSchema>;

export const MovieSchema = z.object({
  page: z.number(),
  results: z.array(MovieResultSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type Movie = z.infer<typeof MovieSchema>;
