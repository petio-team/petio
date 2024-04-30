/**
 * Represents the type of media server.
 */
export enum MediaServerType {
  PLEX = 'plex',
  JELLYFIN = 'jellyfin',
  EMBY = 'emby',
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
export type CreateMediaServerProps = Omit<
  MediaServerProps,
  'libraries' | 'users'
> & {
  libraries?: string[];
  users?: string[];
};
