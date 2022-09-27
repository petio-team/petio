import { Zodios } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';

import { CalendarEndpoint } from './calendar';
import { LanguageEndpoint } from './language';
import { MovieEndpoint } from './movie';
import { QualityProfileEndpoint } from './qualityProfile';
import { QueueEndpoint } from './queue';
import { RootFolderEndpoint } from './rootFolder';
import { SystemStatusEndpoint } from './status';
import { TagEndpoint } from './tag';

export default (url: URL, token: string) => {
  const client = new Zodios(url.toString(), [
    ...MovieEndpoint,
    ...CalendarEndpoint,
    ...RootFolderEndpoint,
    ...QualityProfileEndpoint,
    ...LanguageEndpoint,
    ...SystemStatusEndpoint,
    ...TagEndpoint,
    ...QueueEndpoint,
  ]);
  client.use(pluginHeader('x-api-key', async () => token));

  return client;
};
