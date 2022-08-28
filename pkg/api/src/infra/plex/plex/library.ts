import { asApi } from '@zodios/core';
import { z } from 'zod';

export const DirectorySchema = z.object({
  allowSync: z.boolean(),
  art: z.string(),
  composite: z.string(),
  filters: z.boolean(),
  refreshing: z.boolean(),
  thumb: z.string(),
  key: z.string(),
  type: z.string(),
  title: z.string(),
  agent: z.string(),
  scanner: z.string(),
  language: z.string(),
  uuid: z.string(),
  updatedAt: z.number(),
  createdAt: z.number(),
  scannedAt: z.number(),
  content: z.boolean(),
  directory: z.boolean(),
  contentChangedAt: z.number(),
  hidden: z.number(),
  Location: z.array(
    z.object({
      id: z.number(),
      path: z.string(),
    }),
  ),
});
export type Directory = z.infer<typeof DirectorySchema>;

export const MetadataSchema = z.object({
  allowSync: z.boolean(),
  librarySectionID: z.number(),
  librarySectionTitle: z.string(),
  librarySectionUUID: z.string(),
  ratingKey: z.string(),
  key: z.string(),
  parentRatingKey: z.string().optional(),
  grandparentRatingKey: z.string().optional(),
  guid: z.string(),
  studio: z.string().optional(),
  parentGuid: z.string().optional(),
  parentStudio: z.string().optional(),
  grandparentKey: z.string().optional(),
  type: z.string(),
  title: z.string(),
  titleSort: z.string().optional(),
  originalTitle: z.string().optional(),
  contentRating: z.string().optional(),
  parentKey: z.string().optional(),
  parentTitle: z.string().optional(),
  parentSummary: z.string().optional(),
  grandparentTitle: z.string().optional(),
  summary: z.string(),
  rating: z.number().optional(),
  index: z.number().optional(),
  parentIndex: z.number().optional(),
  parentYear: z.number().optional(),
  audienceRating: z.number().optional(),
  year: z.number().optional(),
  tagline: z.string().optional(),
  thumb: z.string(),
  art: z.string(),
  duration: z.number().optional(),
  parentThumb: z.string().optional(),
  parentTheme: z.string().optional(),
  leafCount: z.number(),
  viewedLeafCount: z.number(),
  originallyAvailableAt: z.string().optional(),
  addedAt: z.number(),
  updatedAt: z.number(),
  primaryExtraKey: z.string().optional(),
  audienceRatingImage: z.string().optional(),
  chapterSource: z.string().optional(),
  ratingImage: z.string().optional(),
  Media: z
    .array(
      z.object({
        id: z.number(),
        duration: z.number(),
        bitrate: z.number(),
        width: z.number(),
        height: z.number(),
        aspectRatio: z.number(),
        audioChannels: z.number(),
        audioCodec: z.string(),
        videoCodec: z.string(),
        videoResolution: z.string(),
        container: z.string(),
        videoFrameRate: z.string(),
        videoProfile: z.string(),
        Part: z.array(
          z.object({
            id: z.number(),
            key: z.string(),
            duration: z.number(),
            file: z.string(),
            size: z.number(),
            audioProfile: z.string().optional(),
            container: z.string(),
            videoProfile: z.string(),
          }),
        ),
      }),
    )
    .optional(),
  Guid: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .optional(),
  Genre: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
  Director: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
  Writer: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
  Country: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
  Role: z
    .array(
      z.object({
        tag: z.string(),
      }),
    )
    .optional(),
});
export type Metadata = z.infer<typeof MetadataSchema>;

export const MediaContainerSchema = z.object({
  MediaContainer: z.object({
    size: z.number(),
    totalSize: z.number().optional(),
    offset: z.number().optional(),
    allowSync: z.boolean(),
    art: z.string().optional(),
    grandparentRatingKey: z.number().optional(),
    grandparentStudio: z.string().optional(),
    grandparentThumb: z.string().optional(),
    grandparentTitle: z.string().optional(),
    content: z.string().optional(),
    identifier: z.string(),
    key: z.string().optional(),
    librarySectionID: z.number().optional(),
    librarySectionTitle: z.string().optional(),
    librarySectionUUID: z.string().uuid().optional(),
    mediaTagPrefix: z.string(),
    mediaTagVersion: z.number(),
    nocache: z.string().optional(),
    thumb: z.string().optional(),
    title1: z.string().optional(),
    title2: z.string().optional(),
    viewGroup: z.string().optional(),
    viewMode: z.number().optional(),
    mixedParents: z.boolean().optional(),
    Metadata: z.array(MetadataSchema).optional(),
    Directory: z.array(DirectorySchema).optional(),
  }),
});
export type MediaContainer = z.infer<typeof MediaContainerSchema>;

export const LibraryEndpoint = asApi([
  {
    description: 'gets the recently added media',
    method: 'get',
    path: '/library/recentlyAdded',
    parameters: [
      {
        description: 'the start point of where to return data from',
        name: 'x-plex-container-start',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: 'the amount of data to return',
        name: 'x-plex-container-size',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
    ],
    response: MediaContainerSchema,
  },
  {
    description: 'gets library sections',
    method: 'get',
    path: '/library/sections',
    parameters: [
      {
        description: 'the start point of where to return data from',
        name: 'x-plex-container-start',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: 'the amount of data to return',
        name: 'x-plex-container-size',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
    ],
    response: MediaContainerSchema,
  },
  {
    description: 'gets library sections by id',
    method: 'get',
    path: '/library/sections/:id',
    parameters: [
      {
        description: 'the start point of where to return data from',
        name: 'x-plex-container-start',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: 'the amount of data to return',
        name: 'x-plex-container-size',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: '',
        name: 'includeGuids',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: MediaContainerSchema,
  },
  {
    description: 'gets library sections by id with all data',
    method: 'get',
    path: '/library/sections/:id/all',
    parameters: [
      {
        description: 'the start point of where to return data from',
        name: 'x-plex-container-start',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: 'the amount of data to return',
        name: 'x-plex-container-size',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: '',
        name: 'includeGuids',
        type: 'Query',
        schema: z.boolean().optional(),
      },
    ],
    response: MediaContainerSchema,
  },
  {
    description: 'gets media metadata by id',
    method: 'get',
    path: '/library/metadata/:id',
    parameters: [],
    response: MediaContainerSchema,
  },
  {
    description: 'gets children metadata from media metadata by id',
    method: 'get',
    path: '/library/metadata/:id/children',
    parameters: [],
    response: MediaContainerSchema,
  },
] as const);
