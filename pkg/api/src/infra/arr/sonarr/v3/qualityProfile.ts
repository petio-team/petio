import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const QualityProfileSchema = z.object({
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
        })
        .optional(),
      items: z.array(
        z
          .object({
            quality: z.object({
              id: z.number(),
              name: z.string(),
              source: z.string(),
              resolution: z.number(),
            }),
            items: z.array(z.unknown()),
            allowed: z.boolean(),
          })
          .optional(),
      ),
      allowed: z.boolean(),
      id: z.number().optional(),
    }),
  ),
  id: z.number(),
});
export type QualityProfile = z.infer<typeof QualityProfileSchema>;

export const QualityProfileEndpoint = makeApi([
  {
    method: 'get',
    path: '/api/v3/qualityprofile',
    parameters: [],
    response: QualityProfileSchema.array(),
  },
]);
