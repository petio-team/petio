import { randomUUID } from 'crypto';
import { z } from 'zod';

export const LibraryDTO = z.object({
  id: z.string().default(randomUUID()),
  key: z.string(),
  title: z.string(),
  agent: z.string(),
  language: z.string(),
  uuid: z.string(),
  libraryScannedAt: z.number(),
  libraryUpdatedAt: z.number(),
  contentChangedAt: z.number(),
  enabled: z.boolean(),
});
export type Library = z.infer<typeof LibraryDTO>;
