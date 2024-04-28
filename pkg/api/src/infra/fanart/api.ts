import { Zodios } from '@zodios/core';
import * as z from 'zod';

import { pluginQuery } from '@/utils/zodios';

import { FANART_API_KEY } from '../config/env';

export enum FanartTypes {
  Movies = 'movies',
  Shows = 'tv',
}

export const TvFanartSchema = z.object({
  name: z.string(),
  thetvdb_id: z.string().optional(),
  hdtvlogo: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  tvposter: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  characterart: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  seasonposter: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
        season: z.string(),
      }),
    )
    .optional(),
  hdclearart: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  tvbanner: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  showbackground: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
        season: z.string(),
      }),
    )
    .optional(),
  tvthumb: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  seasonbanner: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
        season: z.string(),
      }),
    )
    .optional(),
  seasonthumb: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
        season: z.string(),
      }),
    )
    .optional(),
});
export type TvFanart = z.infer<typeof TvFanartSchema>;

export const MovieFanartSchema = z.object({
  name: z.string(),
  tmdb_id: z.string().optional(),
  imdb_id: z.string().optional(),
  hdmovielogo: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  moviethumb: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  movieposter: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  moviebackground: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  moviebanner: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
  moviedisc: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
        disc: z.string(),
        disc_type: z.string(),
      }),
    )
    .optional(),
  hdmovieclearart: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().transform((val) => val.replace('http://', 'https://')),
        lang: z.string(),
        likes: z.string(),
      }),
    )
    .optional(),
});
export type MovieFanart = z.infer<typeof MovieFanartSchema>;

export const FanartSchema = TvFanartSchema.merge(MovieFanartSchema);
export const FanartAPI = new Zodios('https://webservice.fanart.tv/v3', [
  {
    method: 'get',
    path: '/:type/:id',
    parameters: [],
    response: FanartSchema,
  },
]);
FanartAPI.use(pluginQuery('api_key', async () => FANART_API_KEY));
