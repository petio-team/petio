import { ContainerBuilder } from 'diod';

import { MovieService } from '@/services/movie/movie-service';
import { FanartMovieProvider } from '@/services/movie/provider/fanart/fanart';
import {
  MovieArtworkProvider,
  MovieDiscoverProvider,
  MovieProvider,
  MovieRatingProvider,
  MovieTrendingProvider,
} from '@/services/movie/provider/provider';
import { ServarrMovieProvider } from '@/services/movie/provider/servarr/servarr';
import { TmdbMovieProvider } from '@/services/movie/provider/tmdb/tmdb';

export default (builder: ContainerBuilder) => {
  builder.register(MovieProvider).use(TmdbMovieProvider).asSingleton();
  builder.register(MovieArtworkProvider).use(FanartMovieProvider).asSingleton();
  builder.register(MovieRatingProvider).use(ServarrMovieProvider).asSingleton();
  builder.register(MovieTrendingProvider).use(TmdbMovieProvider).asSingleton();
  builder.register(MovieDiscoverProvider).use(TmdbMovieProvider).asSingleton();
  builder.registerAndUse(MovieService).asSingleton();
};
