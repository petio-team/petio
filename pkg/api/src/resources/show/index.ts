import { ContainerBuilder } from 'diod';

import { ShowMapper } from './mapper';
import { ShowMongooseRepository } from './mongoose';
import { ShowRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ShowMapper).asSingleton().addTag('mapper');
  builder
    .register(ShowRepository)
    .useClass(ShowMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
