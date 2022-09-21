import { randomUUID } from 'crypto';
import { z } from 'zod';

import { UserDTO } from '../user/dto';

export const ReviewDTO = z.object({
  id: z.string().default(randomUUID()),
  tmdb_id: z.number(),
  score: z.number(),
  comment: z.string(),
  user: z.union([UserDTO, z.string()]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Review = z.infer<typeof ReviewDTO>;
