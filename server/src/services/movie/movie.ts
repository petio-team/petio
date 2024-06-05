import { Service } from 'diod';
import { None, Option, Some } from 'oxide.ts';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { ApiError } from '@/infrastructure/tmdb/client';
import { toQueryString } from '@/infrastructure/utils/object-to-query-string';
import { MovieEntity } from '@/resources/movie/entity';
import { MovieRepository } from '@/resources/movie/repository';
import { CacheService } from '@/services/cache/cache';
import {
  MovieArtworkProvider,
  MovieProvider,
  MovieRatingProvider,
} from '@/services/movie/provider/provider';
import { MovieLookupOptions } from '@/services/movie/types';

@Service()
export class MovieService {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  /**
   * The logger used for logging messages in the Movie service.
   */
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private movieRepository: MovieRepository,
    private movieProvider: MovieProvider,
    private artworkProvider: MovieArtworkProvider,
    private ratingProvider: MovieRatingProvider,
    private cache: CacheService,
  ) {
    this.logger = logger.child({ module: 'services.movie' });
  }

  /**
   * Looks up a movie by its ID and retrieves its details, artwork, and ratings.
   * @param id - The ID of the movie to lookup.
   * @param options - Optional parameters for the movie lookup.
   * @returns A Promise that resolves to an Option containing the movie entity if found, or None if not found.
   */
  async getMovie(
    id: number,
    options?: MovieLookupOptions,
  ): Promise<Option<MovieEntity>> {
    const optionsAsString =
      options && Object.keys(options).length ? toQueryString(options) : '';
    const cacheName = `movie.${id}${optionsAsString}`;
    try {
      const result = await this.cache.wrap(
        cacheName,
        async () => {
          const [dbResult, detailsResult, artworkResult, ratingProvider] =
            await Promise.all([
              options?.withServer
                ? this.movieRepository.findOne({
                    tmdb_id: id,
                  })
                : undefined,
              this.movieProvider.getDetails(id),
              options?.withArtwork
                ? this.artworkProvider.getArtworkImages(id)
                : undefined,
              options?.withRating
                ? this.ratingProvider.getRatings(id)
                : undefined,
            ]);
          if (detailsResult.isErr()) {
            return undefined;
          }
          const details = detailsResult.unwrap();
          const ratings = ratingProvider?.isOk() ? ratingProvider.unwrap() : {};
          const artwork = artworkResult?.isOk() ? artworkResult.unwrap() : {};
          return {
            ...details,
            artwork: {
              ...details.artwork,
              ...artwork,
            },
            rating: {
              ...details.rating,
              ...ratings,
            },
            providers: {
              ...details.providers,
              plex: dbResult?.isSome()
                ? {
                    id: parseInt(dbResult.unwrap().id, 10),
                  }
                : undefined,
            },
          };
        },
        this.defaultCacheTTL,
      );
      return result ? Some(MovieEntity.create(result)) : None;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          this.logger.debug(
            { movieId: id },
            'Failed to lookup movie: movie not found',
          );
          return None;
        }
      }
      this.logger.error(
        { movieId: id, error },
        'Failed to lookup movie: an error occurred',
      );
      return None;
    }
  }

  /**
   * Retrieves a batch of movies based on the given array of movie IDs.
   * @param ids - An array of movie IDs.
   * @param minified - A boolean indicating whether to retrieve the movies in a minified format.
   * @returns A promise that resolves to an array of movie results.
   */
  async getBatchedMovies(ids: number[], minified: boolean = false) {
    const movieResult = await Promise.all(
      ids.map((m) =>
        this.getMovie(m, {
          withArtwork: !minified,
          withServer: true,
          withRating: !minified,
        }),
      ),
    );
    return movieResult.filter((m) => m.isSome()).map((m) => m.unwrap());
  }
}
