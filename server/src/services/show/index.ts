import { ContainerBuilder } from 'diod';

import { ShowService } from '@/services/show/show';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(ShowService).asSingleton();
};
