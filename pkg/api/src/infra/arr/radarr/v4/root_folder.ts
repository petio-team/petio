import { asApi } from '@zodios/core';
import { z } from 'zod';

export const RootFolderSchema = z.array(
  z.object({
    id: z.number(),
    path: z.string(),
    accessible: z.boolean(),
    freeSpace: z.number(),
    unmappedFolders: z
      .array(z.object({ name: z.string(), path: z.string() }))
      .optional(),
  }),
);
export type RootFolder = z.infer<typeof RootFolderSchema>;

export const RootFolderEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/rootfolder',
    parameters: [],
    response: RootFolderSchema,
  },
]);
