import { ContainerBuilder } from 'diod';

import builder from '@/resources';

export default () => {
  const containerBuilder = new ContainerBuilder();
  builder(containerBuilder);

  return containerBuilder.build({ autowire: true });
};
