import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const LanguageSchema = z.object({
  id: z.number(),
  name: z.string(),
  nameLower: z.string(),
});
export type Language = z.infer<typeof LanguageSchema>;

export const LanguageEndpoint = makeApi([
  {
    method: 'get',
    path: '/api/v3/language',
    parameters: [],
    response: LanguageSchema.array(),
  },
]);
