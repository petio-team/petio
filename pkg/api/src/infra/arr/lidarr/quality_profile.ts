import { asApi } from '@zodios/core';
import { z } from 'zod';

export const QualityProfileSchema = z.object({
  name: z.string(),
  upgradeAllowed: z.boolean(),
  cutoff: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      items: z.array(
        z.object({
          quality: z.object({ id: z.number(), name: z.string() }),
          items: z.array(z.string()), // unsure of the correction from z.unknown() to z.string()
          allowed: z.boolean(),
        }),
      ),
      allowed: z.boolean(),
      id: z.number(),
    }),
  ),
  id: z.number(),
});
export const QualityProfilesSchema = z.array(QualityProfileSchema);

export type QualityProfile = z.infer<typeof QualityProfileSchema>;
export type QualityProfiles = z.infer<typeof QualityProfilesSchema>;

export const QualityProfileEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v1/qualityprofile',
    parameters: [],
    response: QualityProfilesSchema,
  },
] as const);
