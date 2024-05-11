import { z } from 'zod';

import { MediaServerType } from '@/resources/media-server/types';

export const MediaServerInputSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(MediaServerType),
  url: z.string().url().min(1),
  token: z.string().min(1),
  enabled: z.boolean(),
});
export type MediaServerInput = z.infer<typeof MediaServerInputSchema>;
