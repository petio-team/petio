import { randomUUID } from 'crypto';
import { z } from 'zod';

export const IMDBDTO = z.object({
  id: z.string().default(randomUUID()),
  imdb_id: z.string(),
  rating: z.number(),
});
export type IMDB = z.infer<typeof IMDBDTO>;
