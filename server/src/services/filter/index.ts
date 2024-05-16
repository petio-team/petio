import { ContainerBuilder } from 'diod';

import { FilterService } from '@/services/filter/filter';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(FilterService).asSingleton();
};
