import { ContainerBuilder } from 'diod';

import { FANART_API_KEY } from '@/infrastructure/config/env';
import { FanartTVAPI } from '@/infrastructure/fanart/client';

export default (builder: ContainerBuilder) => {
  builder
    .register(FanartTVAPI)
    .useFactory(() => {
      const client = new FanartTVAPI();
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
};
