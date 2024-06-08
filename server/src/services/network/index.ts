import { ContainerBuilder } from 'diod';

import { NetworkService } from '@/services/network/network-service';
import { NetworkDetailsProvider } from '@/services/network/provider/provider';
import { NetworkTmdbProvider } from '@/services/network/provider/tmdb/tmdb';

export default (builder: ContainerBuilder) => {
  builder
    .register(NetworkDetailsProvider)
    .useClass(NetworkTmdbProvider)
    .asSingleton();
  builder.registerAndUse(NetworkService).asSingleton();
};
