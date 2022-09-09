import { randomUUID } from 'crypto';
import { z } from 'zod';

export const MovieGuidDTO = z.object({
  plex_id: z.number(),
  tmdb_id: z.number(),
  imdb_id: z.string().optional(),
  tvdb_id: z.number().optional(),
});
export type MovieGuid = z.infer<typeof MovieGuidDTO>;

export const MovieDetailsDTO = z.object({
  title: z.string(),
  overview: z.string(),
  director: z.string(),
  screenplay: z.string(),
  language: z.string(),
  language_code: z.string(),
  year: z.number(),
  certification: z.string(),
  genres: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array(),
  companies: z
    .object({
      id: z.number(),
      image_url: z.string().url(),
    })
    .array(),
  trailers: z.string().array(),
  reviews: z.unknown().array(),
  casts: z
    .object({
      id: z.number(),
      name: z.string(),
      character: z.string(),
      image_url: z.string().url(),
    })
    .array(),
});
export type MovieDetails = z.infer<typeof MovieDetailsDTO>;

export const MovieMediaDTO = z.object({
  path: z.string(),
  resolution: z.string(),
});
export type MovieMedia = z.infer<typeof MovieMediaDTO>;

export const MovieDTO = z.object({
  id: z.string().default(randomUUID()),
  guids: MovieGuidDTO,
  details: MovieDetailsDTO,
  media: MovieMediaDTO.array(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Movie = z.infer<typeof MovieDTO>;
