/**
 * Represents the properties of a media server.
 */
export type MediaServerProps = {
  name: string;
  url: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
  libraries: string[];
  users: string[];
};

/**
 * Represents the properties for creating a media server.
 */
export type CreateMediaServerProps = Omit<MediaServerProps, 'libraries' | 'users'> & {
  libraries?: string[];
  users?: string[];
};
