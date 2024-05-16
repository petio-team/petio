import { ContainerBuilder } from 'diod';

import { MovieService } from '@/services/movie/movie';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(MovieService).asSingleton();
};
