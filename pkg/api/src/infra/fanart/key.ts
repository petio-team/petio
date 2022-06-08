import { AxiosRequestConfig } from "axios";
import { ZodiosInstance, ZodiosEnpointDescriptions } from "@zodios/core";

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
  return (zodios: ZodiosInstance<Api>) => {
    zodios.axios.interceptors.request.use(createRequestInterceptor(provider));
  };
}
