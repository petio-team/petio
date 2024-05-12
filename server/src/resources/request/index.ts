import { ContainerBuilder } from 'diod';

import { RequestMapper } from './mapper';
import { RequestMongooseRepository } from './mongoose';
import { RequestRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(RequestMapper).asSingleton().addTag('mapper');
  builder
    .register(RequestRepository)
    .useClass(RequestMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
