import { randomUUID } from 'crypto';
import { z } from 'zod';

import { MediaServerDTO } from '../mediaserver/dto';

export const ProfileDTO = z.object({
  id: z.string().default(randomUUID()),
  name: z.string(),
  mediaservers: z.union([MediaServerDTO.array(), z.string().array()]),
  autoApprove: z.object({
    tv: z.boolean(),
    movie: z.boolean(),
  }),
  default: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Profile = z.infer<typeof ProfileDTO>;

// Make a profile object with default values applied
export const MakeProfile = (request?: Partial<Profile>): Profile => {
  const defaults = ProfileDTO.parse({});
  return { ...defaults, ...request };
};
