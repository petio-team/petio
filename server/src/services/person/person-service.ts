import { Service } from 'diod';
import { None, Option, Some } from 'oxide.ts';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { PersonEntity } from '@/resources/person/entity';
import { PersonProps } from '@/resources/person/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import { MovieService } from '@/services/movie/movie-service';
import {
  PersonDetailsProvider,
  PersonTrendingProvider,
} from '@/services/person/provider/provider';
import { GetDetailsOptions } from '@/services/person/types';
import { ShowService } from '@/services/show/show-service';

@Service()
export class PersonService {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  private logger: pino.Logger;

  constructor(
    private readonly personDetailsProvider: PersonDetailsProvider,
    private readonly personTrendingProvider: PersonTrendingProvider,
    private readonly movieService: MovieService,
    private readonly showService: ShowService,
    private readonly cacheProvider: CacheProvider,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'services.person' });
  }

  /**
   * Retrieves the details of a person by their ID.
   * @param id - The ID of the person.
   * @returns A Promise that resolves to an Option containing the person entity if found, or None if not found.
   */
  async getDetails(
    id: number,
    options?: GetDetailsOptions,
  ): Promise<Option<PersonEntity>> {
    try {
      const start =  performance.now();
      const personResult = await this.personDetailsProvider.getDetails(id);
      if (!personResult.isOk()) {
        return None;
      }
      const person = personResult.unwrap();
      if (options?.withMedia) {
        await Promise.all([
          ...person.media.movies.map(async (media) =>
            this.movieService.getMovie(media.provider.tmdbId, {
              withArtwork: true,
              withRating: true,
              withServer: true,
            }),
          ),
          ...person.media.shows.map(async (media) =>
            this.showService.getShow(media.provider.tmdbId, {
              withArtwork: true,
              withServer: true,
            }),
          ),
        ]);
      }
      const end = performance.now();
      this.logger.debug(
        { personId: id, name: person.name },
        `got person details in ${Math.round(end - start)}ms`,
      );
      return Some(person);
    } catch (error) {
      this.logger.error({ error }, 'Error fetching person details');
      return None;
    }
  }

  /**
   * Retrieves the trending people.
   * @returns A Promise that resolves to an Option of PersonEntity array.
   */
  async getTrending(): Promise<PersonEntity[]> {
    try {
      const trending = await this.cacheProvider.wrap<PersonProps[]>(
        'person.trending',
        async () => {
          const ids = await this.personTrendingProvider.getTrending();
          const results = await Promise.all(
            ids.unwrap().map((id) => this.getDetails(id, { withMedia: true })),
          );
          return results
            .map((result) => result.unwrap())
            .map((person) => person.getProps());
        },
        this.defaultCacheTTL,
      );
      return trending.map((props) => PersonEntity.create(props));
    } catch (error) {
      this.logger.error({ error }, 'Error fetching trending people');
      return [];
    }
  }
}
