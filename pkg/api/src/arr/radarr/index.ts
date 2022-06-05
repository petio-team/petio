import { Zodios, ZodiosInstance } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';

import { CalendarEndpoint } from './calendar';
import { LanguageEndpoint } from './language';
import { MovieEndpoint } from './movie';
import { QualityProfileEndpoint } from './quality_profile';
import { QueueEndpoint } from "./queue";
import { RootFolderEndpoint } from './root_folder';
import { SystemStatusEndpoint } from './status';
import { TagEndpoint } from './tag';

export const RadarrAPIEndpoints = [
  ...MovieEndpoint,
  ...CalendarEndpoint,
  ...RootFolderEndpoint,
  ...QualityProfileEndpoint,
  ...LanguageEndpoint,
  ...SystemStatusEndpoint,
  ...TagEndpoint,
  ...QueueEndpoint,
] as const;

export const RadarrAPIClient = (
  url: URL,
  token: string,
): ZodiosInstance<typeof RadarrAPIEndpoints> => {
  const client = new Zodios(url.toString(), RadarrAPIEndpoints);
  client.use(pluginHeader('x-api-key', async () => token));

  return client;
};
