import { asApi } from '@zodios/core';
import { z } from 'zod';

export const ArtistSchema = z.object({
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
  lastAlbum: z.object({
    artistMetadataId: z.number(),
    foreignAlbumId: z.string(),
    oldForeignAlbumIds: z.array(z.unknown()),
    title: z.string(),
    overview: z.string(),
    disambiguation: z.string(),
    releaseDate: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        coverType: z.string(),
        extension: z.string(),
      }),
    ),
    links: z.array(z.object({ url: z.string(), name: z.string() })),
    genres: z.array(z.string()),
    albumType: z.string(),
    secondaryTypes: z.array(z.unknown()),
    ratings: z.object({ votes: z.number(), value: z.number() }),
    cleanTitle: z.string(),
    profileId: z.number(),
    monitored: z.boolean(),
    anyReleaseOk: z.boolean(),
    lastInfoSync: z.string(),
    added: z.string(),
    addOptions: z.object({
      addType: z.string(),
      searchForNewAlbum: z.boolean(),
    }),
    artistMetadata: z.null(),
    albumReleases: z.null(),
    artist: z.null(),
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
  path: z.string(),
  qualityProfileId: z.number(),
  metadataProfileId: z.number(),
  monitored: z.boolean(),
  monitorNewItems: z.string(),
  rootFolderPath: z.string(),
  genres: z.array(z.string()),
  cleanName: z.string(),
  sortName: z.string(),
  tags: z.array(z.number()),
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
  remotePoster: z.string().optional(),
  addOptions: z
    .object({
      monitor: z.string(),
      searchForMissingAlbums: z.boolean(),
    })
    .optional(),
});

export const ArtistsSchema = z.array(ArtistSchema);

export type Artist = z.infer<typeof ArtistSchema>;
export type Artists = z.infer<typeof ArtistsSchema>;

export const ArtistEndPoint = asApi([
  {
    method: 'get',
    path: '/api/v1/artist',
    parameters: [
      {
        name: 'mbId',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ArtistsSchema,
  },
  // {
  //   method: 'post',
  //   path: '/api/v1/artist',
  //   parameters: [
  //     {
  //       name: 'mbId',
  //       type: 'Query',
  //       schema: z.string().optional(),
  //     },
  //   ],
  //   response: ArtistsSchema,
  // },
  {
    method: 'get',
    path: '/api/v1/artist/lookup',
    parameters: [
      {
        name: 'term',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: ArtistsSchema,
  },
  {
    method: 'post',
    path: '/api/v1/artist',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ArtistSchema,
      },
    ],
    response: ArtistSchema,
  },
  {
    method: 'get',
    path: '/api/v1/artist/:id',
    parameters: [],
    response: ArtistSchema,
  },
  {
    method: 'put',
    path: '/api/v1/artist/:id',
    parameters: [],
    response: ArtistSchema,
  },
  {
    method: 'delete',
    path: '/api/v1/artist/:id',
    parameters: [],
    response: ArtistSchema,
  },
] as const);
