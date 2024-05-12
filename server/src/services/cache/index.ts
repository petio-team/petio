import { ContainerBuilder } from 'diod';

import { CacheService } from '@/services/cache/cache';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(CacheService);
};
