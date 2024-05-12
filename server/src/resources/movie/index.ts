import { ContainerBuilder } from 'diod';

import { MovieMapper } from './mapper';
import { MovieMongooseRepository } from './mongoose';
import { MovieRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(MovieMapper).asSingleton().addTag('mapper');
  builder
    .register(MovieRepository)
    .useClass(MovieMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
