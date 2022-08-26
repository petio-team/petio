import { asApi } from '@zodios/core';
import * as z from 'zod';

export const MovieDetailsSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  belongs_to_collection: z.union([
    z.object({
      id: z.number(),
      name: z.string(),
      poster_path: z.union([z.string(), z.null()]),
      backdrop_path: z.string().or(z.null()),
    }),
    z.null(),
  ]),
  budget: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  production_companies: z
    .array(
      z.object({
        id: z.number(),
        logo_path: z.string().or(z.null()),
        name: z.string(),
        origin_country: z.string(),
      }),
    )
    .optional(),
  production_countries: z.array(
    z.object({ iso_3166_1: z.string(), name: z.string() }),
  ),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
  videos: z.object({
    results: z.array(
      z.object({
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
      }),
    ),
  }),
});
export type MovieDetails = z.infer<typeof MovieDetailsSchema>;

export const MovieDetailsAPI = asApi([
  {
    method: 'get',
    path: '/movie/:id',
    parameters: [
      {
        name: 'append_to_response',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: MovieDetailsSchema,
  },
] as const);
