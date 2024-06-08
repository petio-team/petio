import { ContainerBuilder } from 'diod';

import { PersonService } from '@/services/person/person-service';
import {
  PersonDetailsProvider,
  PersonTrendingProvider,
} from '@/services/person/provider/provider';
import { TmdbPersonProvider } from '@/services/person/provider/tmdb/tmdb';

export default (builder: ContainerBuilder) => {
  builder
    .register(PersonDetailsProvider)
    .useClass(TmdbPersonProvider)
    .asSingleton();
  builder
    .register(PersonTrendingProvider)
    .useClass(TmdbPersonProvider)
    .asSingleton();
  builder.registerAndUse(PersonService).asSingleton();
};
