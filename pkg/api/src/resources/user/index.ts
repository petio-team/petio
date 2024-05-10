import { ContainerBuilder } from 'diod';

import { UserMapper } from './mapper';
import { UserMongooseRepository } from './mongoose';
import { UserRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(UserMapper).asSingleton().addTag('mapper');
  builder
    .register(UserRepository)
    .useClass(UserMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
