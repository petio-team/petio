import logger from '@/loaders/logger';
import { UserModel } from '@/models/user';

export default class QuotaSystem {
  async reset() {
    logger.verbose('QUOTA: Reseting Quotas', { label: 'requests.quotas' });
    UserModel.updateMany({}, { $set: { quotaCount: 0 } });
  }
}
