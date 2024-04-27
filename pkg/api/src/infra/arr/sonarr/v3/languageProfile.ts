import { makeApi } from '@zodios/core';
import { z } from 'zod';

const LanguageProfileSchema = z.object({
  name: z.string(),
  upgradeAllowed: z.boolean(),
  cutoff: z.object({ id: z.number(), name: z.string() }),
  languages: z.array(
    z.object({
      language: z.object({ id: z.number(), name: z.string() }),
      allowed: z.boolean(),
    }),
  ),
  id: z.number(),
});
export type LanguageProfile = z.infer<typeof LanguageProfileSchema>;

export const LanguageProfileEndpoint = makeApi([
  {
    method: 'get',
    path: '/api/v3/languageprofile',
    parameters: [],
    response: LanguageProfileSchema.array(),
  },
]);
