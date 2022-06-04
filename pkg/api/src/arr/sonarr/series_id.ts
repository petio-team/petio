import { asApi } from '@zodios/core';
import { z } from 'zod';

export const SeriesIdSchema = z.object({
  title: z.string(),
  alternateTitles: z.array(z.unknown()),
  sortTitle: z.string(),
  status: z.string(),
  ended: z.boolean(),
  overview: z.string(),
  previousAiring: z.string(),
  network: z.string(),
  airTime: z.string(),
  images: z.array(
    z.object({ coverType: z.string(), url: z.string(), remoteUrl: z.string() }),
  ),
  seasons: z.array(
    z.object({
      seasonNumber: z.number(),
      monitored: z.boolean(),
      statistics: z.object({
        previousAiring: z.string(),
        episodeFileCount: z.number(),
        episodeCount: z.number(),
        totalEpisodeCount: z.number(),
        sizeOnDisk: z.number(),
        releaseGroups: z.array(z.string()),
        percentOfEpisodes: z.number(),
      }),
    }),
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
  rootFolderPath: z.string(),
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
    releaseGroups: z.array(z.string()),
    percentOfEpisodes: z.number(),
  }),
  id: z.number(),
});
export type SeriesId = z.infer<typeof SeriesIdSchema>;

export const SeriesIdEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/series/:id',
    parameters: [],
    response: SeriesIdSchema,
  },
] as const);
