import { ContainerBuilder } from 'diod';

import { MediaLibraryMapper } from './mapper';
import { MediaLibraryMongooseRepository } from './mongoose';
import { MediaLibraryRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(MediaLibraryMapper).asSingleton().addTag('mapper');
  builder
    .register(MediaLibraryRepository)
    .useClass(MediaLibraryMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
