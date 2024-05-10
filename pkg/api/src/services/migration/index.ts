import { ContainerBuilder } from 'diod';

import { MigrationService } from '@/services/migration/migration';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(MigrationService).asSingleton();
};
