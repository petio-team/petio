import cluster from 'cluster';
import { ContainerBuilder } from 'diod';

import { Master } from '@/infrastructure/worker/master';
import { Worker } from '@/infrastructure/worker/worker';

export default (builder: ContainerBuilder) => {
  if (cluster.isPrimary) {
    builder.registerAndUse(Master).asSingleton();
  } else {
    builder.registerAndUse(Worker).asSingleton();
  }
};
