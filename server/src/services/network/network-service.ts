import { Service } from 'diod';
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
      return networks.map((network) => NetworkEntity.create(network));
    } catch (error) {
      this.logger.error({ error }, 'Error fetching networks');
      return [];
    }
  }
}
