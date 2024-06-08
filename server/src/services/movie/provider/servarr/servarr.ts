import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import {
  ApiError,
  ServarrRadarrAPIClient,
} from '@/infrastructure/servarr/radarr-api/client';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  MovieProviderRatingResponse,
  MovieRatingProvider,
} from '@/services/movie/provider/provider';

@Service()
export class ServarrMovieRatingProvider implements MovieRatingProvider {
  /**
   * The default time-to-live (TTL) for caching movie ratings data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  constructor(
    private client: ServarrRadarrAPIClient,
    private cache: CacheProvider,
  ) {}

  /**
   * Retrieves the ratings for a movie from the Servarr movie provider.
   * @param id - The ID of the movie.
   * @returns A promise that resolves to a `MovieProviderRatingResponse` object containing the ratings.
   * @throws {NotFoundException} If the movie rating is not found.
   * @throws {InternalServerErrorException} If there is an error retrieving the movie rating.
   */
  async getRatings(id: number): Promise<MovieProviderRatingResponse> {
    try {
      const results = await this.cache.wrap(
        `servarr.movie.${id}.ratings`,
        async () => {
          const detailsResult = await this.client.movie.getMovieById({
            movieId: id,
          });
          return {
            tmdb: detailsResult.MovieRatings.Tmdb.Value,
            imdb: detailsResult.MovieRatings.Imdb?.Value,
            metacritic: detailsResult.MovieRatings.Metacritic?.Value,
            rottenTomatoes: detailsResult.MovieRatings.RottenTomatoes?.Value,
          };
        },
        this.defaultCacheTTL,
      );
      return Ok(results);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Movie rating not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to get movie rating'),
      );
    }
  }
}
