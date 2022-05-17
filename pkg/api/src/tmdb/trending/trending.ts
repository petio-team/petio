import { asApi } from "zodios";
import * as z from "zod";

export enum MediaType {
  All = "all",
  Movie = "movie",
  Tv = "tv",
  Person = "person",
}

export enum TimeWindow {
  Day = "day",
  Week = "week",
}

export const TrendingMovieSchema = z.object({
  original_title: z.string(),
  poster_path: z.string(),
  video: z.boolean(),
  id: z.number(),
  overview: z.string(),
  release_date: z.string(),
  title: z.string(),
  adult: z.boolean(),
  backdrop_path: z.string(),
  vote_count: z.number(),
  genre_ids: z.array(z.number()),
  vote_average: z.number(),
  original_language: z.string(),
  popularity: z.number(),
  media_type: z.string(),
});
export type TrendingMovie = z.infer<typeof TrendingMovieSchema>;

export const TrendingTvSchema = z.object({
  backdrop_path: z.string(),
  first_air_date: z.string(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  name: z.string(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  poster_path: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  media_type: z.string(),
});
export type TrendingTv = z.infer<typeof TrendingTvSchema>;

export const TrendingPeopleSchema = z.object({
  profile_path: z.union([z.string(), z.null()]),
  id: z.number(),
  gender: z.number(),
  known_for: z.array(
    z.object({
      genre_ids: z.array(z.number()),
      original_language: z.string().optional(),
      original_title: z.string().optional(),
      poster_path: z.string(),
      title: z.string().optional(),
      video: z.boolean().optional(),
      vote_average: z.number(),
      popularity: z.number(),
      vote_count: z.number(),
      release_date: z.string().optional(),
      overview: z.string(),
      id: z.number(),
      adult: z.boolean().optional(),
      backdrop_path: z.string(),
      media_type: z.string(),
    })
  ),
  adult: z.boolean(),
  known_for_department: z.string(),
  name: z.string(),
  popularity: z.number(),
  media_type: z.string(),
});
export type TrendingPeople = z.infer<typeof TrendingPeopleSchema>;

const TrendingSchema = z.object({
  page: z.number(),
  results: z.array(
    z.union([TrendingPeopleSchema, TrendingMovieSchema, TrendingTvSchema])
  ),
  total_pages: z.number(),
  total_results: z.number(),
});
export type Trending = z.infer<typeof TrendingSchema>;

export const TrendingAPI = asApi([
  {
    method: "get",
    path: "/trending/:media_type/:time_window",
    parameters: [],
    response: TrendingSchema,
  },
] as const);
