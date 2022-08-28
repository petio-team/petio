import {
  Zodios,
  ZodiosEnpointDescriptions,
  ZodiosInstance,
} from '@zodios/core';
import { AxiosRequestConfig } from 'axios';

import { HistoryEndpoint } from './plex/history';
import { LibraryEndpoint } from './plex/library';
import { SystemStatusEndpoint } from './plex/system';

export const PlexAPI = (url: URL, token: string) => {
  const api = new Zodios(url.toString(), [
    ...LibraryEndpoint,
    ...SystemStatusEndpoint,
    ...HistoryEndpoint,
  ] as const);
  api.use(
    pluginApiKey({
      getApiKey: async () => token,
    }),
  );
  return api;
};

export interface ApiKeyPluginConfig {
  getApiKey: () => Promise<string>;
}

function createRequestInterceptor(provider: ApiKeyPluginConfig) {
  return async (config: AxiosRequestConfig) => {
    config.headers = {
      ...config.headers,
      'x-plex-token': await provider.getApiKey(),
    };
    return config;
  };
}

export function pluginApiKey<Api extends ZodiosEnpointDescriptions>(
  provider: ApiKeyPluginConfig,
) {
  return (zodios: ZodiosInstance<Api>) => {
    zodios.axios.interceptors.request.use(createRequestInterceptor(provider));
  };
}
