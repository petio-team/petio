import { ContainerBuilder } from 'diod';

import { SettingsMapper } from './mapper';
import { SettingsMongooseRepository } from './mongoose';
import { SettingsRepository } from './repository';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(SettingsMapper).asSingleton().addTag('mapper');
  builder
    .register(SettingsRepository)
    .useClass(SettingsMongooseRepository)
    .asSingleton()
    .addTag('repository');
};
