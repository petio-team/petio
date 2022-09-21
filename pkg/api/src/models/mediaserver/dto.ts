import { randomUUID } from 'crypto';
import { z } from 'zod';

export enum MediaServerType {
  Plex = 'plex',
}

export const MediaServerDTO = z.object({
  id: z.string().default(randomUUID()),
  type: z.nativeEnum(MediaServerType),
  name: z.string(),
  url: z.instanceof(URL),
  token: z.string(),
  enabled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});
export type MediaServer = z.infer<typeof MediaServerDTO>;

// Make a media server object with default values applied
export const MakeMediaServer = (ms?: Partial<MediaServer>): MediaServer => {
  const defaults = MediaServerDTO.parse({});
  return { ...defaults, ...ms };
};
