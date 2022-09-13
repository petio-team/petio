import { randomUUID } from 'crypto';
import { z } from 'zod';

import { ReviewDTO } from '../review/dto';

export const ShowGuidsDTO = z.object({
  plex_id: z.number(),
  imdb_id: z.string(),
  tvdb_id: z.number(),
  tmdb_id: z.number(),
});
export type ShowGuids = z.infer<typeof ShowGuidsDTO>;

export const ShowDetailsImagesDTO = z.object({
  poster_url: z.string().url(),
  background_url: z.string().url(),
});

export const ShowDetailsGenresDTO = z.object({
  id: z.number(),
  name: z.string(),
});

export const ShowDetailsRatingsDTO = z.object({
  imdb: z.number(),
  tmdb: z.number(),
});

export const ShowDetailsCreatorDTO = z.object({
  id: z.number(),
  name: z.string(),
});

export const ShowDetailsCastDTO = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string(),
  poster_url: z.string(),
});

export const ShowDetailsVideosDTO = z.object({
  type: z.string(),
  url: z.string().url(),
});

export const ShowDetailsSeasonEpisode = z.object({
  key: z.string(),
  number: z.number(),
  resolution: z.string(),
});

export const ShowDetailsSeasonDTO = z.object({
  key: z.number(),
  number: z.number(),
  episodes: ShowDetailsSeasonEpisode.array(),
});

export const ShowDetailsDTO = z.object({
  title: z.string(),
  overview: z.string(),
  network: z.string(),
  air_date: z.date(),
  runtime: z.number(),
  year: z.number(),
  certification: z.string(),
  language: z.string(),
  language_code: z.string(),
  number_of_episodes: z.number(),
  number_of_seasons: z.number(),
  vote_average: z.number(),
  images: ShowDetailsImagesDTO,
  genres: ShowDetailsGenresDTO,
  ratings: ShowDetailsRatingsDTO,
  creators: ShowDetailsCreatorDTO.array(),
  cast: ShowDetailsCastDTO.array(),
  videos: ShowDetailsVideosDTO.array(),
  reviews: z.union([ReviewDTO, z.string()]).array(),
  seasons: ShowDetailsSeasonDTO.array(),
});
export type ShowDetails = z.infer<typeof ShowDetailsDTO>;

export const ShowMediaDTO = z.object({
  path: z.string(),
  resolution: z.string(),
});
export type ShowMedia = z.infer<typeof ShowMediaDTO>;

export const ShowDTO = z.object({
  id: z.string().default(randomUUID()),
  guids: ShowGuidsDTO,
  details: ShowDetailsDTO,
  media: ShowMediaDTO,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Show = z.infer<typeof ShowDTO>;
