import { ContainerBuilder } from 'diod';

import infra from '@/infra';
import resources from '@/resources';

export default () => {
  const containerBuilder = new ContainerBuilder();
  infra(containerBuilder);
  resources(containerBuilder);

  return containerBuilder.build({ autowire: true });
};
