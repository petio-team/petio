import { ContainerBuilder } from 'diod';

import { FilterMapper } from './mapper';
import { FilterMongooseRepository } from './mongoose';
import { FilterRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(FilterMapper).asSingleton().addTag('mapper');
  builder
    .register(FilterRepository)
    .useClass(FilterMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
