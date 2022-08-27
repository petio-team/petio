import { ZodiosEnpointDescriptions, ZodiosInstance } from '@zodios/core';
import { AxiosRequestConfig } from 'axios';

export interface ApiKeyPluginConfig {
  getApiKey: () => Promise<string>;
}

function createRequestInterceptor(provider: ApiKeyPluginConfig) {
  return async (config: AxiosRequestConfig) => {
    config.params = {
      ...config.params,
      api_key: await provider.getApiKey(),
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
