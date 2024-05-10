import { ContainerBuilder } from 'diod';

import infra from '@/infrastructure';
import resources from '@/resources';
import services from '@/services';

export default () => {
  const containerBuilder = new ContainerBuilder();
  infra(containerBuilder);
  resources(containerBuilder);
  services(containerBuilder);

  return containerBuilder.build({ autowire: true });
};
