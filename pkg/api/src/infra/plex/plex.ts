import { Zodios, ZodiosInstance, makeApi } from '@zodios/core';
import { pluginHeader } from '@zodios/plugins';

import { HistoryEndpoint } from './plex/history';
import { LibraryEndpoint } from './plex/library';
import { SystemStatusEndpoint } from './plex/system';

export const PlexApiEndpoints = makeApi([
  ...LibraryEndpoint,
  ...SystemStatusEndpoint,
  ...HistoryEndpoint,
]);

// eslint-disable-next-line import/prefer-default-export
export const PlexAPIClient = (url: string, token: string) => {
  const api = new Zodios(url, PlexApiEndpoints);
  api.use(pluginHeader('X-Plex-Token', async () => token));
  return api;
};

export class PlexAPI {
  private client: ZodiosInstance<typeof PlexApiEndpoints>;

  constructor(url: string, token: string) {
    this.client = new Zodios(url, PlexApiEndpoints);
    this.client.use(pluginHeader('X-Plex-Token', async () => token));
  }

  /**
   * Retrieves the library sections from the Plex server.
   * @returns {Promise<any>} A promise that resolves with the library sections.
   */
  async getLibrary() {
    return this.client.get('/library/sections');
  }

  /**
   * Retrieves the system status from the Plex API.
   * @returns A Promise that resolves to the system status response.
   */
  async getSystemStatus() {
    return this.client.get('/');
  }

  /**
   * Retrieves the history of sessions from the Plex server.
   *
   * @param accountID - The ID of the account for which to retrieve the history. Optional.
   * @param sort - The sorting order for the history. Optional. Can be 'viewedAt:desc' or 'viewedAt:asc'.
   * @param viewedAt - The timestamp to filter the history. Optional.
   * @param librarySectionID - The ID of the library section to filter the history. Optional.
   * @returns A promise that resolves to the history of sessions.
   */
  async getHistory(
    accountID?: string,
    sort?: 'viewedAt:desc' | 'viewedAt:asc',
    viewedAt?: number,
    librarySectionID?: number,
    start?: number,
    size?: number,
  ) {
    return this.client.get('/status/sessions/history/all', {
      queries: {
        accountID,
        sort,
        'viewedAt>': viewedAt,
        librarySectionID,
      },
      headers: {
        'X-Plex-Container-Start': start || 0,
        'X-Plex-Container-Size': size || 1000,
      },
    });
  }

  /**
   * Retrieves the metadata for a library item with the specified key.
   * @param key - The key of the library item.
   * @returns A Promise that resolves to the metadata of the library item.
   */
  async getLibraryMetadata(key: string) {
    return this.client.get(`/library/metadata/:id`, {
      params: {
        id: key,
      },
    });
  }

  /**
   * Retrieves the metadata children for a given library key.
   * @param key - The library key.
   * @returns A Promise that resolves to the metadata children.
   */
  async getLibraryMetadataChildren(key: string) {
    return this.client.get(`/library/metadata/:id/children`, {
      params: {
        id: key,
      },
    });
  }
}
