import { Service } from 'diod';
import { None, Ok, Option, Some } from 'oxide.ts';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { NetworkEntity } from '@/resources/network/entity';
import { NetworkProps } from '@/resources/network/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import { NetworkDetailsProvider } from '@/services/network/provider/provider';
import { FixedNetworkIdsList } from '@/services/network/types';

@Service()
export class NetworkService {
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private readonly networkDetailsProvider: NetworkDetailsProvider,
    private readonly cacheProvider: CacheProvider,
  ) {
    this.logger = logger.child({ module: 'services.network' });
  }

  /**
   * Retrieves the network details for a given ID.
   * @param id - The ID of the network.
   * @returns A Promise that resolves to an Option containing the network entity if found, or None if not found.
   */
  async getNetworkDetails(id: number): Promise<Option<NetworkEntity>> {
    try {
      const start = Date.now();
      const details = await this.cacheProvider.wrap<NetworkProps | undefined>(
        `network.${id}`,
        async () => {
          const results = await this.networkDetailsProvider.getDetails(id);
          if (!results.isOk()) {
            return undefined;
          }
          const network = results.unwrap();
          return {
            ...network,
            provider: {
              ...network.providers,
              tmdbId: id,
            },
          };
        },
      );
      if (!details) {
        return None;
      }
      const end = Date.now();
      this.logger.debug(
        { networkId: id, name: details.name, time: end - start },
        `got network details`,
      );
      return Some(NetworkEntity.create(details));
    } catch (error) {
      this.logger.error({ error }, 'Error fetching network');
      return None;
    }
  }

  /**
   * Retrieves the list of networks.
   * @returns A promise that resolves to an array of NetworkEntity objects.
   */
  async getNetworks(): Promise<NetworkEntity[]> {
    try {
      const networks = await this.cacheProvider.wrap<NetworkProps[]>(
        'networks',
        async () => {
          const results = await Promise.all(
            FixedNetworkIdsList.map(async (id) =>
              this.networkDetailsProvider.getDetails(id),
            ),
          );
          return results
            .filter((result) => result.isOk())
            .map((result) => result.unwrap());
        },
      );
      return networks.map((network) => {
        this.logger.debug(
          { networkId: network.providers.tmdbId, name: network.name },
          `got network details`,
        );
        return NetworkEntity.create(network);
      });
    } catch (error) {
      this.logger.error({ error }, 'Error fetching networks');
      return [];
    }
  }
}
