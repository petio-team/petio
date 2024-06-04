import { ContainerBuilder } from 'diod';

import { MovieService } from '@/services/movie/movie';
import { FanartMovieArtworkProvider } from '@/services/movie/provider/fanart/fanart';
import {
  MovieArtworkProvider,
  MovieProvider,
  MovieRatingProvider,
} from '@/services/movie/provider/provider';
import { ServarrMovieRatingProvider } from '@/services/movie/provider/servarr/servarr';
import { TmdbMovieProvider } from '@/services/movie/provider/tmdb/tmdb';

export default (builder: ContainerBuilder) => {
  builder.register(MovieProvider).use(TmdbMovieProvider).asSingleton();
  builder
    .register(MovieArtworkProvider)
    .use(FanartMovieArtworkProvider)
    .asSingleton();
  builder
    .register(MovieRatingProvider)
    .use(ServarrMovieRatingProvider)
    .asSingleton();
  builder.registerAndUse(MovieService).asSingleton();
};
