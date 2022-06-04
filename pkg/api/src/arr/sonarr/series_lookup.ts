import { asApi } from '@zodios/core';
import { z } from 'zod';

export const SeriesLookupSchema = z.array(
  z.object({
    title: z.string(),
    sortTitle: z.string(),
    status: z.string(),
    ended: z.boolean(),
    overview: z.string(),
    network: z.string(),
    airTime: z.string(),
    images: z.array(
      z.object({
        coverType: z.string(),
        url: z.string(),
        remoteUrl: z.string(),
      }),
    ),
    remotePoster: z.string(),
    seasons: z.array(
      z.object({ seasonNumber: z.number(), monitored: z.boolean() }),
    ),
    year: z.number(),
    path: z.string(),
    qualityProfileId: z.number(),
    languageProfileId: z.number(),
    seasonFolder: z.boolean(),
    monitored: z.boolean(),
    useSceneNumbering: z.boolean(),
    runtime: z.number(),
    tvdbId: z.number(),
    tvRageId: z.number(),
    tvMazeId: z.number(),
    firstAired: z.string(),
    seriesType: z.string(),
    cleanTitle: z.string(),
    imdbId: z.string(),
    titleSlug: z.string(),
    folder: z.string(),
    certification: z.string(),
    genres: z.array(z.string()),
    tags: z.array(z.unknown()),
    added: z.string(),
    ratings: z.object({ votes: z.number(), value: z.number() }),
    statistics: z.object({
      seasonCount: z.number(),
      episodeFileCount: z.number(),
      episodeCount: z.number(),
      totalEpisodeCount: z.number(),
      sizeOnDisk: z.number(),
      percentOfEpisodes: z.number(),
    }),
    id: z.number(),
  }),
);
export type SeriesLookup = z.infer<typeof SeriesLookupSchema>;

export const SeriesLookupEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/series/lookup',
    parameters: [
      {
        name: 'term',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: SeriesLookupSchema,
  },
] as const);
