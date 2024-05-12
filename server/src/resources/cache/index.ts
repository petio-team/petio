import { ContainerBuilder } from 'diod';

import { CacheMapper } from './mapper';
import { CacheMongooseRepository } from './mongoose';
import { CacheRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(CacheMapper).asSingleton().addTag('mapper');
  builder
    .register(CacheRepository)
    .useClass(CacheMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
