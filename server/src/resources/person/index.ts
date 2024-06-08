import { ContainerBuilder } from 'diod';

import { PersonMapper } from '@/resources/person/mapper';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(PersonMapper).asSingleton();
};
