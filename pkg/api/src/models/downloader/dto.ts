import { randomUUID } from 'crypto';
import { z } from 'zod';

export enum DownloaderType {
  Sonarr = 'sonarr',
  Radarr = 'radarr',
}

export const DownloaderPathDTO = z.object({
  id: z.number(),
  location: z.string(),
});
export type DownloaderPath = z.infer<typeof DownloaderPathDTO>;

export const DownloaderProfileDTO = z.object({
  id: z.number(),
  name: z.string(),
});
export type DownloaderProfile = z.infer<typeof DownloaderProfileDTO>;

export const DownloaderLanguageDTO = z.object({
  id: z.number(),
  name: z.string(),
});
export type DownloaderLanguage = z.infer<typeof DownloaderLanguageDTO>;

export const DownloaderMediaTypeDTO = z.object({
  id: z.number(),
  name: z.string(),
});
export type DownloaderMediaType = z.infer<typeof DownloaderMediaTypeDTO>;

export const DownloaderDTO = z.object({
  id: z.string().default(randomUUID()),
  name: z.string(),
  type: z.nativeEnum(DownloaderType),
  url: z.string().url(),
  token: z.string(),
  path: DownloaderPathDTO,
  profile: DownloaderProfileDTO,
  language: DownloaderLanguageDTO,
  media_type: DownloaderMediaTypeDTO,
  enabled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Downloader = z.infer<typeof DownloaderDTO>;
