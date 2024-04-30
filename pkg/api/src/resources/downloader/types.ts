export enum DownloaderType {
  SONARR = 'sonarr',
  RADARR = 'radarr',
}

/**
 * Represents the properties of a Downloader.
 */
export type DownloaderProps = {
  name: string;
  type: DownloaderType;
  url: string;
  token: string;
  metadata: Record<string, unknown>;
  enabled: boolean;
};

/**
 * Represents the properties for creating a Downloader.
 */
export type CreateDownloaderProps = DownloaderProps & {
  // TODO: add additional fields
};