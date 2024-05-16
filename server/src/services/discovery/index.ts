import { ContainerBuilder } from 'diod';

import { DiscoveryService } from '@/services/discovery/discovery';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(DiscoveryService).asSingleton();
};
