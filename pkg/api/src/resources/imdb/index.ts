import { ContainerBuilder } from 'diod';

import { ImdbMapper } from './mapper';
import { ImdbMongooseRepository } from './mongoose';
import { ImdbRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ImdbMapper).asSingleton().addTag('mapper');
  builder
    .register(ImdbRepository)
    .useClass(ImdbMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
