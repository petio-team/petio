import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the type of media server.
 */
export enum MediaServerType {
  PLEX = 'plex',
}

/**
 * Represents the properties of a media server.
 */
export type MediaServerProps = {
  name: string;
  type: MediaServerType;
  url: string;
  token: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
  libraries: string[];
  users: string[];
};

/**
 * Represents the properties for creating a media server.
 */
export type CreateMediaServerProps = Override<
  MediaServerProps,
  {
    libraries?: string[];
    users?: string[];
  }
>;
