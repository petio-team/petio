import URL from 'url';
import { Zodios } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';

import { CalendarEndpoint } from './calendar';
import { LanguageEndpoint } from './language';
import { LanguageProfileEndpoint } from './language_profile';
import { QualityProfileEndpoint } from './quality_profile';
import { QueueEndpoint } from './queue';
import { RootFolderEndpoint } from './root_folder';
import { SeriesEndpoint } from './series';
import { SystemStatusEndpoint } from './status';
import { TagEndpoint } from './tag';

export const SonarrAPIClient = (url: URL, token: string) => {
  const client = new Zodios(url.toString(), [
    ...SystemStatusEndpoint,
    ...LanguageProfileEndpoint,
    ...LanguageEndpoint,
    ...CalendarEndpoint,
    ...QualityProfileEndpoint,
    ...RootFolderEndpoint,
    ...SeriesEndpoint,
    ...TagEndpoint,
    ...QueueEndpoint,
  ]);

  client.use(pluginHeader('x-api-key', async () => token));
  return client;
};
