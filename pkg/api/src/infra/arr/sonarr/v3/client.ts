import { Zodios, makeApi } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';
import URL from 'url';

import { CalendarEndpoint } from './calendar';
import { LanguageEndpoint } from './language';
import { LanguageProfileEndpoint } from './languageProfile';
import { QualityProfileEndpoint } from './qualityProfile';
import { QueueEndpoint } from './queue';
import { RootFolderEndpoint } from './rootFolder';
import { SeriesEndpoint } from './series';
import { SystemStatusEndpoint } from './status';
import { TagEndpoint } from './tag';

export const endpoints = makeApi([
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

export default (url: URL, token: string) => {
  const client = new Zodios(url.toString(), endpoints);
  client.use(pluginHeader('x-api-key', async () => token));
  return client;
};
