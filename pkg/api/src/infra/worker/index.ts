import cluster from 'cluster';
import { ContainerBuilder } from 'diod';

import { Master } from '@/infra/worker/master';

export default (builder: ContainerBuilder) => {
  if (cluster.isPrimary) {
    builder.registerAndUse(Master).asSingleton();
  } else {
    builder.registerAndUse(Worker).asSingleton();
  }
};
