import cluster from 'cluster';
import { ContainerBuilder } from 'diod';

import { SetupService } from '@/services/setup/setup';

export default (builder: ContainerBuilder) => {
  if (cluster.isWorker) {
    builder.registerAndUse(SetupService).asSingleton();
  }
};
