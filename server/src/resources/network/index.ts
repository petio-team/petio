import { ContainerBuilder } from 'diod';

import { NetworkMapper } from '@/resources/network/mapper';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(NetworkMapper).asSingleton();
};
