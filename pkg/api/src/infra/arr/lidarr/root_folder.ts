import { asApi } from '@zodios/core';
import { z } from 'zod';

export const RootFolderSchema = z.array(
  z.object({
    name: z.string(),
    path: z.string(),
    defaultMetadataProfileId: z.number(),
    defaultQualityProfileId: z.number(),
    defaultMonitorOption: z.string(),
    defaultNewItemMonitorOption: z.string(),
    defaultTags: z.array(z.string()),
    accessible: z.boolean(),
    freeSpace: z.number(),
    totalSpace: z.number(),
    id: z.number(),
  }),
);
export type RootFolder = z.infer<typeof RootFolderSchema>;

export const RootFolderEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v1/rootfolder',
    parameters: [],
    response: RootFolderSchema,
  },
] as const);
