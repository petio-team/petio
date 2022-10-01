import { asApi } from '@zodios/core';
import { z } from 'zod';

export const TrackSchema = z.array(
  z.union([
    z.object({
      artistId: z.number(),
      foreignTrackId: z.string(),
      foreignRecordingId: z.string(),
      trackFileId: z.number(),
      albumId: z.number(),
      explicit: z.boolean(),
      absoluteTrackNumber: z.number(),
      trackNumber: z.string(),
      title: z.string(),
      duration: z.number(),
      mediumNumber: z.number(),
      hasFile: z.boolean(),
      ratings: z.object({ votes: z.number(), value: z.number() }),
      grabbed: z.boolean(),
      id: z.number(),
    }),
    z.object({
      artistId: z.number(),
      foreignTrackId: z.string(),
      foreignRecordingId: z.string(),
      trackFileId: z.number(),
      albumId: z.number(),
      explicit: z.boolean(),
      absoluteTrackNumber: z.number(),
      trackNumber: z.string(),
      title: z.string(),
      duration: z.number(),
      mediumNumber: z.number(),
      hasFile: z.boolean(),
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
      }),
      ratings: z.object({ votes: z.number(), value: z.number() }),
      grabbed: z.boolean(),
      id: z.number(),
    }),
  ]),
);
export type Track = z.infer<typeof TrackSchema>;

export const TrackEndPoint = asApi([
  {
    method: 'get',
    path: '/api/v1/track',
    parameters: [
      {
        name: 'artistId',
        type: 'Query',
        schema: z.number().positive(),
      },
      {
        name: 'albumId',
        type: 'Query',
        schema: z.number().positive().optional(),
      },
      {
        name: 'albumReleaseId',
        type: 'Query',
        schema: z.number().positive().optional(),
      },
      {
        name: 'trackIds',
        type: 'Query',
        schema: z.array(z.number().positive()).optional(),
      },
    ],
    response: TrackSchema,
  },
  {
    method: 'get',
    path: '/api/v1/track/:id',
    parameters: [],
    response: TrackSchema,
  },
] as const);
