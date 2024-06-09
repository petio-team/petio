import { ContainerBuilder } from 'diod';

import { FANART_API_KEY, TMDB_API_KEY } from '@/infrastructure/config/env';
import {
  FanartTvApiClient,
  ServarrRadarrApiClient,
  TheMovieDatabaseApiClient,
} from '@/infrastructure/generated/clients';

export default (builder: ContainerBuilder) => {
  builder
    .register(TheMovieDatabaseApiClient)
    .useFactory(() => {
      const client = new TheMovieDatabaseApiClient();
      client.request.config.interceptors.request.use((config) => {
        const cfg = config;
        cfg.params = {
          ...config.params,
          api_key: TMDB_API_KEY,
        };
        return cfg;
      });
      return client;
    })
    .asSingleton();
  builder
    .register(FanartTvApiClient)
    .useFactory(() => {
      const client = new FanartTvApiClient();
      client.request.config.interceptors.request.use((config) => {
        const cfg = config;
        cfg.params = {
          ...config.params,
          api_key: FANART_API_KEY,
        };
        return cfg;
      });
      return client;
    })
    .asSingleton();
  builder
    .register(ServarrRadarrApiClient)
    .useFactory(() => new ServarrRadarrApiClient())
    .asSingleton();
};
