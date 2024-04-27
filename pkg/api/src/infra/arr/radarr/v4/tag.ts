import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const TagSchema = z.object({
  label: z.string(),
  id: z.number(),
});
export type Tag = z.infer<typeof TagSchema>;

export const TagEndpoint = makeApi([
  {
    method: 'get',
    path: '/api/v3/tag',
    parameters: [],
    response: TagSchema.array(),
  },
]);
