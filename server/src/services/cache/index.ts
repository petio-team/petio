import { ContainerBuilder } from 'diod';

import { CacheManagerProvider } from '@/services/cache/cache-manager';
import { CacheProvider } from '@/services/cache/cache-provider';
import { CacheService } from '@/services/cache/cache-service';

export default (builder: ContainerBuilder) => {
  builder.register(CacheProvider).use(CacheManagerProvider).asSingleton();
  builder.registerAndUse(CacheService).asSingleton();
};
