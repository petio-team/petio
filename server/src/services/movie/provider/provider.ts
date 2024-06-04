import { Result } from 'oxide.ts';
import { SetRequired } from 'type-fest';

import { ExceptionBase } from '@/infrastructure/exceptions/base';
import { MovieProps } from '@/resources/movie/types';

export type MovieProviderDetailsResponse = Result<MovieProps, ExceptionBase>;
export type MovieCollections = SetRequired<
  MovieProps,
  'collections'
>['collections'];
export type MovieProviderCollectionDetailsResponse = Result<
  MovieCollections | undefined,
  ExceptionBase
>;
export abstract class MovieProvider {
  abstract getDetails(id: number): Promise<MovieProviderDetailsResponse>;
}

export type MovieArtworkImages = SetRequired<MovieProps, 'artwork'>['artwork'];
export type MovieProviderArtworkImagesResponse = Result<
  MovieArtworkImages,
  ExceptionBase
>;
export abstract class MovieArtworkProvider {
  abstract getArtworkImages(
    id: number,
  ): Promise<MovieProviderArtworkImagesResponse>;
}

export type MovieRating = SetRequired<MovieProps, 'rating'>['rating'];
export type MovieProviderRatingResponse = Result<MovieRating, ExceptionBase>;
export abstract class MovieRatingProvider {
  abstract getRatings(id: number): Promise<MovieProviderRatingResponse>;
}
