import { ContainerBuilder } from 'diod';

import { NotificationMapper } from './mapper';
import { NotificationMongooseRepository } from './mongoose';
import { NotificationRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(NotificationMapper).asSingleton().addTag('mapper');
  builder
    .register(NotificationRepository)
    .useClass(NotificationMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
