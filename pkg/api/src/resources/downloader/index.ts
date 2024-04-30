import { ContainerBuilder } from 'diod';

import { DownloaderMapper } from './mapper';
import { DownloaderMongooseRepository } from './mongoose';
import { DownloaderRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(DownloaderMapper).asSingleton().addTag('mapper');
  builder
    .register(DownloaderRepository)
    .useClass(DownloaderMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
