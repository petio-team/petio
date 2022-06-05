import { asApi } from '@zodios/core';
import { z } from 'zod';

export const SeriesSchema = z.object({
  title: z.string(),
  alternateTitles: z.array(z.unknown()).optional(),
  sortTitle: z.string(),
  status: z.string(),
  ended: z.boolean(),
  overview: z.string(),
  previousAiring: z.string().optional(),
  network: z.string(),
  airTime: z.string(),
  images: z.array(
    z.object({
      coverType: z.string(),
      url: z.string(),
      remoteUrl: z.string(),
    }),
  ),
  remotePoster: z.string().optional(),
  seasons: z.array(
    z
      .object({
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
      })
      .optional(),
  ),
  year: z.number(),
  path: z.string(),
  qualityProfileId: z.number(),
  languageProfileId: z.number(),
  seasonFolder: z.boolean().optional(),
  monitored: z.boolean(),
  useSceneNumbering: z.boolean(),
  runtime: z.number(),
  tvdbId: z.number(),
  tvRageId: z.number().optional(),
  tvMazeId: z.number(),
  firstAired: z.string(),
  seriesType: z.string(),
  cleanTitle: z.string(),
  imdbId: z.string(),
  titleSlug: z.string(),
  rootFolderPath: z.string().optional(),
  folder: z.string().optional(),
  certifications: z.string().optional(),
  genres: z.array(z.string()),
  tags: z.array(z.unknown()),
  added: z.string(),
  ratings: z.object({
    votes: z.number(),
    value: z.number(),
  }),
  statistics: z.object({
    seasonCount: z.number(),
    episodeFileCount: z.number(),
    episodeCount: z.number(),
    totalEpisodeCount: z.number(),
    sizeOnDisk: z.number(),
    releaseGroups: z.array(z.string()),
    percentOfEpisodes: z.number(),
  }),
  addOptions: z
    .object({
      ignoreEpisodesWithFiles: z.boolean().optional(),
      ignoreEpisodesWithoutFiles: z.boolean().optional(),
      searchForMissingEpisodes: z.boolean().optional(),
    })
    .optional(),
  id: z.number(),
});
export const SeriesLookupSchema = z.array(SeriesSchema);

export type Series = z.infer<typeof SeriesSchema>;
export type SeriesLookup = z.infer<typeof SeriesLookupSchema>;

export const SeriesEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/series/:id',
    parameters: [],
    response: SeriesSchema,
  },
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
  {
    method: 'put',
    path: '/api/v3/series/:id',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SeriesSchema,
      },
    ],
    response: SeriesSchema,
  },
  {
    method: 'post',
    path: '/api/v3/series',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SeriesSchema,
      },
    ],
    response: SeriesSchema,
  },
  {
    method: 'delete',
    path: '/api/v3/series/:id',
    parameters: [
      {
        name: 'deleteFiles',
        type: 'Query',
        schema: z.boolean().default(false).optional(),
      },
    ],
    response: z.object({}),
  },
] as const);
