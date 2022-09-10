import { asApi } from '@zodios/core';
import { z } from 'zod';

export const QualityProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  upgradeAllowed: z.boolean(),
  cutoff: z.number(),
  items: z.array(
    z.object({
      quality: z
        .object({
          id: z.number(),
          name: z.string(),
          source: z.string(),
          resolution: z.number(),
          modifier: z.string(),
        })
        .optional(),
      items: z.array(z.any()),
      allowed: z.boolean(),
    }),
  ),
  minFormatScore: z.number(),
  cutoffFormatScore: z.number(),
  formatItems: z.array(
    z.object({
      id: z.number().optional(),
      format: z.number(),
      name: z.string(),
      score: z.number(),
    }),
  ),
  language: z.object({ id: z.number(), name: z.string() }),
});
export const QualityProfilesSchema = z.array(QualityProfileSchema);

export type QualityProfile = z.infer<typeof QualityProfileSchema>;
export type QualityProfiles = z.infer<typeof QualityProfilesSchema>;

export const QualityProfileEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/qualityprofile',
    parameters: [],
    response: QualityProfilesSchema,
  },
]);
