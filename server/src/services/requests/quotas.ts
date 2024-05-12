import { getFromContainer } from '@/infrastructure/container/container';
import logger from '@/infrastructure/logger/logger';
import { UserRepository } from '@/resources/user/repository';

export default class QuotaSystem {
  async reset() {
    logger.debug('QUOTA: Reseting Quotas');
    getFromContainer(UserRepository).updateMany(
      {},
      { $set: { quotaCount: 0 } },
    );
  }
}
