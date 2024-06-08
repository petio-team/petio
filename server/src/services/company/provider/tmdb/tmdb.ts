import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { ApiError, TheMovieDatabaseClient } from '@/infrastructure/tmdb/client';
import { CompanyProps } from '@/resources/company/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  CompanyDetailsProvider,
  CompanyDetailsProviderResponse,
} from '@/services/company/provider/provider';

@Service()
export class CompanyTmdbProvider implements CompanyDetailsProvider {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  constructor(
    private readonly client: TheMovieDatabaseClient,
    private readonly cacheProvider: CacheProvider,
  ) {}

  /**
   * Retrieves the details of a company from the TMDB provider.
   * @param id - The ID of the company.
   * @returns A promise that resolves to the company details.
   * @throws {NotFoundException} If the network is not found.
   * @throws {InternalServerErrorException} If there is an error fetching the network details.
   */
  async getDetails(id: number): Promise<CompanyDetailsProviderResponse> {
    try {
      const details = await this.cacheProvider.wrap<CompanyProps>(
        `tmdb.company.${id}`,
        async () => {
          const response = await this.client.default.companyDetails({
            companyId: id,
          });
          return {
            name: response.name!,
            artwork: {
              logo: response.logo_path
                ? {
                    url: response.logo_path,
                    source: 'tmdb',
                  }
                : undefined,
            },
            provider: {
              tmdbId: response.id!,
            },
            source: 'tmdb',
          };
        },
        this.defaultCacheTTL,
      );
      return Ok(details);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Network not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch network details'),
      );
    }
  }
}
