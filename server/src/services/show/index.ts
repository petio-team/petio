import { ContainerBuilder } from 'diod';

import { FanartShowProvider } from '@/services/show/provider/fanart/fanart';
import {
  ShowArtworkProvider,
  ShowDiscoverProvider,
  ShowProvider,
  ShowTrendingProvider,
} from '@/services/show/provider/provider';
import { TmdbShowProvider } from '@/services/show/provider/tmdb/tmdb';
import { ShowService } from '@/services/show/show-service';

export default (builder: ContainerBuilder) => {
  builder.register(ShowProvider).use(TmdbShowProvider).asSingleton();
  builder.register(ShowArtworkProvider).use(FanartShowProvider).asSingleton();
  builder.register(ShowTrendingProvider).use(TmdbShowProvider).asSingleton();
  builder.register(ShowDiscoverProvider).use(TmdbShowProvider).asSingleton();
  builder.registerAndUse(ShowService).asSingleton();
};
