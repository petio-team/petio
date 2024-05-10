import { ContainerBuilder } from 'diod';

import { ReviewMapper } from './mapper';
import { ReviewMongooseRepository } from './mongoose';
import { ReviewRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ReviewMapper).asSingleton().addTag('mapper');
  builder
    .register(ReviewRepository)
    .useClass(ReviewMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
