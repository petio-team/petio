import { AxiosRequestConfig } from 'axios';
import { ContainerBuilder } from 'diod';

import { TMDB_API_KEY } from '@/infrastructure/config/env';
import { Interceptors } from '@/infrastructure/plex/core/OpenAPI';
import { TheMovieDatabaseClient } from '@/infrastructure/tmdb/client';

export default (builder: ContainerBuilder) => {
  builder.register(TheMovieDatabaseClient).useFactory(() => {
    const requestInterceptor = new Interceptors<AxiosRequestConfig>();
    requestInterceptor.use((config: AxiosRequestConfig) => {
      const cfg = config;
      cfg.params = { ...config.params, api_key: TMDB_API_KEY };
      return cfg;
    });
    return new TheMovieDatabaseClient({
      interceptors: {
        request: requestInterceptor,
        response: new Interceptors(),
      },
    });
  });
};
