import { ContainerBuilder } from 'diod';

import { ServarrRadarrAPIClient } from '@/infrastructure/servarr/radarr-api/client';

export default (builder: ContainerBuilder) => {
  builder
    .register(ServarrRadarrAPIClient)
    .useFactory(() => new ServarrRadarrAPIClient())
    .asSingleton();
};
