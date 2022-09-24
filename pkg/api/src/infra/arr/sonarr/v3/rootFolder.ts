import { asApi } from '@zodios/core';
import { z } from 'zod';

export const RootFolderSchema = z.object({
  path: z.string({
    description: 'does a stringy',
  }),
  accessible: z.boolean(),
  freeSpace: z.number(),
  unmappedFolders: z.array(
    z.object({ name: z.string(), path: z.string() }).optional(),
  ),
  id: z.number(),
});
export type RootFolder = z.infer<typeof RootFolderSchema>;

export const RootFolderEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/rootfolder',
    parameters: [],
    response: RootFolderSchema.array(),
  },
]);
