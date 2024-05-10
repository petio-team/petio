import { ContainerBuilder } from 'diod';

import { ProfileMapper } from './mapper';
import { ProfileMongooseRepository } from './mongoose';
import { ProfileRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ProfileMapper).asSingleton().addTag('mapper');
  builder
    .register(ProfileRepository)
    .useClass(ProfileMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
