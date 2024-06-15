import { Service } from 'diod';
import { None, Option, Some } from 'oxide.ts';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { toQueryString } from '@/infrastructure/utils/object-to-query-string';
import { MovieEntity } from '@/resources/movie/entity';
import { MovieRepository } from '@/resources/movie/repository';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  MovieArtworkProvider,
  MovieDiscoverProvider,
  MovieProvider,
  MovieRatingProvider,
  MovieTrendingProvider,
} from '@/services/movie/provider/provider';
import {
  MovieDiscoverOptions,
  MovieLookupOptions,
} from '@/services/movie/types';

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
    private cacheProvider: CacheProvider,
    private movieRepository: MovieRepository,
    private movieProvider: MovieProvider,
    private artworkProvider: MovieArtworkProvider,
    private ratingProvider: MovieRatingProvider,
    private trendingProvider: MovieTrendingProvider,
    private discoverProvider: MovieDiscoverProvider,
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
      const start = performance.now();
      const result = await this.cacheProvider.wrap(
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
              logo: details.artwork.logo,
              thumbnail: artwork?.thumbnail || details.artwork.thumbnail,
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
      if (!result) {
        this.logger.debug(
          { movieId: id },
          'Failed to lookup movie: movie not found',
        );
        return None;
      }
      const end = performance.now();
      this.logger.debug(
        { movieId: id, name: result.title },
        `got movie details in ${Math.round(end - start)}ms`,
      );
      return Some(MovieEntity.create(result));
    } catch (error) {
      this.logger.error(
        { movieId: id, error },
        'Failed to lookup movie: an error occurred',
      );
      return None;
    }
  }

  /**
   * Retrieves the trending movies.
   * @returns A Promise that resolves to an array of MovieEntity objects representing the trending movies.
   */
  async getTrending(limit: number = 30): Promise<MovieEntity[]> {
    const results = await this.cacheProvider.wrap(
      `movie.trending`,
      async () => {
        const trendingResults = await this.trendingProvider.getTrending();
        if (trendingResults.isErr()) {
          return [];
        }
        const trending = trendingResults.unwrap();
        const data = await Promise.all(
          trending.slice(0, limit).map((movie) =>
            this.getMovie(movie, {
              withArtwork: true,
              withRating: true,
              withServer: true,
            }),
          ),
        );
        return data
          .filter((m) => m.isSome())
          .map((m) => m.unwrap())
          .map((m) => m.getProps());
      },
      this.defaultCacheTTL,
    );
    return results.map((m) => MovieEntity.create(m));
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

  /**
   * Retrieves a list of discovered movies with additional details.
   *
   * @param limit - The maximum number of movies to retrieve. Defaults to 30.
   * @returns A promise that resolves to an array of MovieEntity objects representing the discovered movies.
   */
  async getDiscover(options?: MovieDiscoverOptions): Promise<MovieEntity[]> {
    try {
      const optionsAsString =
        options && Object.keys(options).length ? toQueryString(options) : '';
      const results = await this.cacheProvider.wrap(
        `movie.discover${optionsAsString}`,
        async () => {
          const discovery = await this.discoverProvider.getDiscover({
            page: options?.page || 1,
            withCompanyId: options?.filterByCompanyId,
          });
          if (discovery.isErr()) {
            return [];
          }
          const data = await Promise.all(
            discovery
              .unwrap()
              .slice(0, options?.limit || 30)
              .map((movie) =>
                this.getMovie(movie, {
                  withArtwork: true,
                  withRating: true,
                  withServer: true,
                }),
              ),
          );
          return data
            .filter((m) => m.isSome())
            .map((m) => m.unwrap())
            .map((m) => m.getProps());
        },
        this.defaultCacheTTL,
      );
      return results.map((m) => MovieEntity.create(m));
    } catch (error) {
      this.logger.error({ error }, 'Error storing discovered data');
      return [];
    }
  }
}
