import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { TheMovieDatabaseApiClient } from '@/infrastructure/generated/clients';
import { ApiError } from '@/infrastructure/generated/tmdb-api-client';
import { NetworkProps } from '@/resources/network/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  NetworkDetailsProvider,
  NetworkDetailsProviderResponse,
} from '@/services/network/provider/provider';

@Service()
export class NetworkTmdbProvider implements NetworkDetailsProvider {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  constructor(
    private readonly client: TheMovieDatabaseApiClient,
    private readonly cacheProvider: CacheProvider,
  ) {}

  /**
   * Retrieves the details of a network from TMDB.
   * @param id - The ID of the network.
   * @returns A promise that resolves to the network details.
   * @throws {NotFoundException} If the network is not found.
   * @throws {InternalServerErrorException} If there is an error fetching the network details.
   */
  async getDetails(id: number): Promise<NetworkDetailsProviderResponse> {
    try {
      const details = await this.cacheProvider.wrap<NetworkProps>(
        `tmdb.network.${id}`,
        async () => {
          const response = await this.client.default.networkDetails({
            networkId: id,
          });
          return {
            id: response.id!,
            name: response.name!,
            artwork: {
              logo: response.logo_path
                ? {
                    url: response.logo_path,
                    source: 'tmdb',
                  }
                : undefined,
            },
            providers: {
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
