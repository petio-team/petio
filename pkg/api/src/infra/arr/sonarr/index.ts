import { Zodios, ZodiosInstance } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';
import URL from 'url';

import { CalendarEndpoint } from './calendar';
import { LanguageProfileEndpoint } from './language_profile';
import { QualityProfileEndpoint } from './quality_profile';
import { QueueEndpoint } from './queue';
import { RootFolderEndpoint } from './root_folder';
import { SeriesEndpoint } from './series';
import { SystemStatusEndpoint } from './status';
import { TagEndpoint } from './tag';

export const SonarrAPIEndpoints = [
  ...SystemStatusEndpoint,
  ...LanguageProfileEndpoint,
  ...CalendarEndpoint,
  ...QualityProfileEndpoint,
  ...RootFolderEndpoint,
  ...SeriesEndpoint,
  ...TagEndpoint,
  ...QueueEndpoint,
] as const;

export const SonarrAPIClient = (
  url: URL,
  token: string,
): ZodiosInstance<typeof SonarrAPIEndpoints> => {
  const client = new Zodios(url.toString(), SonarrAPIEndpoints);
  client.use(pluginHeader('x-api-key', async () => token));

  return client;
};