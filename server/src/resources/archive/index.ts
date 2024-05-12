import { ContainerBuilder } from 'diod';

import { ArchiveMapper } from './mapper';
import { ArchiveMongooseRepository } from './mongoose';
import { ArchiveRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ArchiveMapper).asSingleton().addTag('mapper');
  builder
    .register(ArchiveRepository)
    .useClass(ArchiveMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
