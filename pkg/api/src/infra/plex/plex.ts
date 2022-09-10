import { Zodios } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';

import { HistoryEndpoint } from './plex/history';
import { LibraryEndpoint } from './plex/library';
import { SystemStatusEndpoint } from './plex/system';

export const PlexAPI = (url: URL, token: string) => {
  const api = new Zodios(url.toString(), [
    ...LibraryEndpoint,
    ...SystemStatusEndpoint,
    ...HistoryEndpoint,
  ]);
  api.use(pluginHeader('x-plex-token', async () => token));
  return api;
};
