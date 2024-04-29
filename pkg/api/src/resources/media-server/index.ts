import { ContainerBuilder } from 'diod';

import { MediaServerMapper } from './mapper';
import { MediaServerMongooseRepository } from './mongoose';
import { MediaServerRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(MediaServerMapper).asSingleton().addTag('mapper');
  builder
    .register(MediaServerRepository)
    .useClass(MediaServerMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
