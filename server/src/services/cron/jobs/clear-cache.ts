import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { AgendaCronService } from '@/services/cron/agenda-cron-service';
import { Jobber } from '@/services/cron/job';
import { JobCronName } from '@/services/cron/types';

import { CacheRepository } from '../../../resources/cache/repository';

@Service()
export class ClearCacheJob implements Jobber {
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private cronService: AgendaCronService,
    private cacheRepository: CacheRepository,
  ) {
    this.logger = logger.child({ module: 'services.cron.jobs.clear-cache' });
  }

  /**
   * Registers the clear cache job with the cron service.
   * This job deletes expired cache entries from the cache repository.
   * If any expired cache entries are deleted, it logs a success message.
   * If no expired cache entries are found, it logs a message indicating that.
   * @returns A promise that resolves when the job is registered.
   */
  register(): Promise<void> {
    return this.cronService.add(
      JobCronName.CLEAR_CACHE,
      async () => {
        const deleted = await this.cacheRepository.deleteMany({
          expiresAt: { $lt: new Date() },
        });
        if (deleted) {
          this.logger.info(`Successfully deleted expired cache entries.`);
        } else {
          this.logger.info(`No expired cache entries to delete.`);
        }
      },
      '1 day',
      {
        lockLifetime: 1000 * 60 * 60 * 24,
      },
    );
  }
}
