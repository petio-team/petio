import { asApi } from '@zodios/core';
import { z } from 'zod';

export const QualityProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  upgradeAllowed: z.boolean(),
  cutoff: z.number(),
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quality: z.object({
        id: z.number(),
        name: z.string(),
        source: z.string(),
        resolution: z.number(),
        modifier: z.string(),
      }),
      items: z.array(z.null()),
      allowed: z.boolean(),
    }),
  ),
  minFormatScore: z.number(),
  cutoffFormatScore: z.number(),
  formatItems: z.array(
    z.object({
      id: z.number(),
      format: z.number(),
      name: z.string(),
      score: z.number(),
    }),
  ),
  language: z.object({ id: z.number(), name: z.string() }),
});
export type QualityProfile = z.infer<typeof QualityProfileSchema>;

export const QualityProfileEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v3/qualityprofile',
    parameters: [],
    response: QualityProfileSchema,
  },
] as const);