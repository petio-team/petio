import { ContainerBuilder } from 'diod';

import { MovieService } from '@/infrastructure/servarr/radarr';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(MovieService).asSingleton();
};
