import { asApi } from '@zodios/core';
import { z } from 'zod';

export const TagSchema = z.array(
  z.object({ label: z.string(), id: z.number() }),
);
export type Tag = z.infer<typeof TagSchema>;

export const TagEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v1/tag',
    parameters: [],
    response: TagSchema,
  },
] as const);
