import { ContainerBuilder } from 'diod';

import { DiscoveryMapper } from './mapper';
import { DiscoveryMongooseRepository } from './mongoose';
import { DiscoveryRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(DiscoveryMapper).asSingleton().addTag('mapper');
  builder
    .register(DiscoveryRepository)
    .useClass(DiscoveryMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
