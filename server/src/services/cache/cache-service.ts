import Bluebird from 'bluebird';
import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import is from '@/infrastructure/utils/is';
import { CompanyEntity } from '@/resources/company/entity';
import { MovieEntity } from '@/resources/movie/entity';
import { NetworkEntity } from '@/resources/network/entity';
import { PersonEntity } from '@/resources/person/entity';
import { ShowEntity } from '@/resources/show/entity';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  CommonResourcesCacheResponse,
  CommonResourcesResponse,
} from '@/services/cache/types';
import { CompanyService } from '@/services/company/company-service';
import { MovieService } from '@/services/movie/movie-service';
import { NetworkService } from '@/services/network/network-service';
import { PersonService } from '@/services/person/person-service';
import { ShowService } from '@/services/show/show-service';

import { providers } from '../notifications/providers/index';

@Service()
export class CacheService {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  /**
   * The logger used for logging messages in the Cache service.
   */
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private readonly cacheProvider: CacheProvider,
    private readonly movieService: MovieService,
    private readonly showService: ShowService,
    private readonly personService: PersonService,
    private readonly networkService: NetworkService,
    private readonly companyService: CompanyService,
  ) {
    this.logger = logger.child({ module: 'services.cache' });
  }

  /**
   * Builds the cache by fetching common resources and logs the time taken.
   * @returns {Promise<void>} A promise that resolves when the cache is built.
   */
  async buildCache(): Promise<void> {
    this.logger.info(
      'Updating cache with common resources, this may take a while...',
    );
    const start = Date.now();
    await this.getCommonResources();
    const end = Date.now();
    this.logger.info(`Finished building cache in ${end - start}ms`);
  }

  /**
   * Retrieves common resources from cache or fetches them from the respective services.
   * @returns A Promise that resolves to a TrendingResponse object containing the fetched resources.
   */
  async getCommonResources(): Promise<CommonResourcesResponse> {
    try {
      const results =
        await this.cacheProvider.wrap<CommonResourcesCacheResponse>(
          'resources.common',
          async () => {
            const [movies, shows, people, networks, companies] =
              await Promise.all([
                this.movieService.getTrending(30),
                this.showService.getTrending(30),
                this.personService.getTrending(30),
                this.networkService.getNetworks(),
                this.companyService.getCompanies(),
              ]);
            const [showDiscovery, movieDiscovery] = await Bluebird.all([
              Bluebird.map(networks, async (network) =>
                this.showService.getDiscover({
                  filterByNetworkId: network.providers.tmdbId,
                }),
              ),
              Bluebird.map(companies, async (company) =>
                this.movieService.getDiscover({
                  filterByCompanyId: parseInt(company.id, 10),
                }),
              ),
            ]);

            return {
              movies: movies.map((movie) => movie.getProps()),
              shows: shows.map((show) => show.getProps()),
              people: people.map((person) => person.getProps()),
              networks: networks.map((network) => network.getProps()),
              companies: companies.map((company) => company.getProps()),
              showDiscovery: showDiscovery
                .flat()
                .map((show) => show.getProps()),
              movieDiscovery: movieDiscovery
                .flat()
                .map((movie) => movie.getProps()),
            };
          },
          this.defaultCacheTTL,
        );
      return {
        movies: results.movies.map((movie) => MovieEntity.create(movie)),
        shows: results.shows.map((show) => ShowEntity.create(show)),
        people: results.people.map((person) => PersonEntity.create(person)),
        networks: results.networks.map((network) =>
          NetworkEntity.create(network),
        ),
        companies: results.companies.map((company) =>
          CompanyEntity.create(company),
        ),
        showDiscovery: results.showDiscovery.map((show) =>
          ShowEntity.create(show),
        ),
        movieDiscovery: results.movieDiscovery.map((movie) =>
          MovieEntity.create(movie),
        ),
      };
    } catch (error) {
      this.logger.error({ error }, 'Error storing trending data');
      return {
        movies: [],
        shows: [],
        people: [],
        networks: [],
        companies: [],
        showDiscovery: [],
        movieDiscovery: [],
      };
    }
  }
}
