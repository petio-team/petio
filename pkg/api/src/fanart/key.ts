import { AxiosRequestConfig } from "axios";
import { Zodios, ZodiosEnpointDescriptions } from "zodios";

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
  provider: ApiKeyPluginConfig
) {
  return (zodios: Zodios<Api>) => {
    zodios.axios.interceptors.request.use(createRequestInterceptor(provider));
  };
}
