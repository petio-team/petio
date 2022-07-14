import { asApi } from '@zodios/core';
import { z } from 'zod';

export const AlbumSchema = z.object({
  title: z.string(),
  disambiguation: z.string(),
  overview: z.string(),
  artistId: z.number(),
  foreignAlbumId: z.string(),
  monitored: z.boolean(),
  anyReleaseOk: z.boolean(),
  profileId: z.number(),
  duration: z.number(),
  albumType: z.string(),
  secondaryTypes: z.array(z.string()),
  mediumCount: z.number(),
  ratings: z.object({ votes: z.number(), value: z.number() }),
  releaseDate: z.string(),
  releases: z.array(
    z.object({
      id: z.number(),
      albumId: z.number(),
      foreignReleaseId: z.string(),
      title: z.string(),
      status: z.string(),
      duration: z.number(),
      trackCount: z.number(),
      media: z.array(
        z.object({
          mediumNumber: z.number(),
          mediumName: z.string(),
          mediumFormat: z.string(),
        }),
      ),
      mediumCount: z.number(),
      disambiguation: z.string(),
      country: z.array(z.string()),
      label: z.array(z.string()),
      format: z.string(),
      monitored: z.boolean(),
    }),
  ),
  genres: z.array(z.string()),
  media: z.array(
    z.object({
      mediumNumber: z.number(),
      mediumName: z.string(),
      mediumFormat: z.string(),
    }),
  ),
  artist: z.object({
    artistMetadataId: z.number(),
    status: z.string(),
    ended: z.boolean(),
    artistName: z.string(),
    foreignArtistId: z.string(),
    tadbId: z.number(),
    discogsId: z.number(),
    overview: z.string(),
    artistType: z.string(),
    disambiguation: z.string(),
    links: z.array(z.object({ url: z.string(), name: z.string() })),
    images: z.array(
      z.object({
        url: z.string(),
        coverType: z.string(),
        extension: z.string(),
      }),
    ),
    path: z.string(),
    qualityProfileId: z.number(),
    metadataProfileId: z.number(),
    monitored: z.boolean(),
    monitorNewItems: z.string(),
    genres: z.array(z.string()),
    cleanName: z.string(),
    sortName: z.string(),
    tags: z.array(z.string()),
    added: z.string(),
    ratings: z.object({ votes: z.number(), value: z.number() }),
    statistics: z.object({
      albumCount: z.number(),
      trackFileCount: z.number(),
      trackCount: z.number(),
      totalTrackCount: z.number(),
      sizeOnDisk: z.number(),
      percentOfTracks: z.number(),
    }),
    id: z.number(),
  }),
  images: z.array(
    z.object({
      url: z.string(),
      coverType: z.string(),
      extension: z.string(),
      remoteUrl: z.string(),
    }),
  ),
  links: z.array(z.object({ url: z.string(), name: z.string() })),
  statistics: z.object({
    trackFileCount: z.number(),
    trackCount: z.number(),
    totalTrackCount: z.number(),
    sizeOnDisk: z.number(),
    percentOfTracks: z.number(),
  }),
  grabbed: z.boolean(),
  id: z.number(),
});

export const AlbumsSchema = z.array(AlbumSchema);

export type Album = z.infer<typeof AlbumSchema>;
export type Albums = z.infer<typeof AlbumsSchema>;

export const AlbumEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v1/album',
    parameters: [
      {
        name: 'artistId',
        type: 'Query',
        schema: z.number().positive().optional(),
      },
      {
        name: 'albumIds',
        type: 'Query',
        schema: z.array(z.number().positive()).optional(),
      },
      {
        name: 'includeAllArtistAlbums',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: AlbumsSchema,
  },
  {
    method: 'get',
    path: '/api/v1/album/:id',
    parameters: [],
    response: AlbumSchema,
  },
  {
    method: 'get',
    path: '/api/v1/album/lookup',
    parameters: [
      {
        name: 'term',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: AlbumsSchema,
  },
  {
    method: 'post',
    path: '/api/v1/album',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: AlbumSchema,
      },
    ],
    response: AlbumSchema,
  },
  {
    method: 'delete',
    path: '/api/v1/album/:id',
    parameters: [],
    response: z.object({}),
  },
] as const);
