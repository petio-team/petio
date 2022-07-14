import { Zodios, ZodiosInstance } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';

import { AlbumEndpoint } from './album';
import { ArtistEndPoint } from './artist';
import { CalendarEndpoint } from './calendar';
import { LanguageEndpoint } from './language';
import { QualityProfileEndpoint } from './quality_profile';
import { QueueEndpoint } from './queue';
import { RootFolderEndpoint } from './root_folder';
import { SystemStatusEndpoint } from './status';
import { TagEndpoint } from './tag';
import { TrackEndPoint } from './track';

export const LidarrAPIEndpoints = [
  ...AlbumEndpoint,
  ...ArtistEndPoint,
  ...TrackEndPoint,
  ...CalendarEndpoint,
  ...RootFolderEndpoint,
  ...QualityProfileEndpoint,
  ...LanguageEndpoint,
  ...SystemStatusEndpoint,
  ...TagEndpoint,
  ...QueueEndpoint,
] as const;

export const LidarrAPIClient = (
  url: URL,
  token: string,
): ZodiosInstance<typeof LidarrAPIEndpoints> => {
  const client = new Zodios(url.toString(), LidarrAPIEndpoints);
  client.use(pluginHeader('x-api-key', async () => token));

  return client;
};
