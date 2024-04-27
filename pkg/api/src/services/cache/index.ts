import { container } from 'tsyringe';

import logger from '@/loaders/logger';
import ISettingsRepository from '@/models/settings/repository';
import trending from '@/services/tmdb/trending';

export default async () => {
  const repo = container.resolve<ISettingsRepository>('Settings');
  const settings = await repo.Get();
  if (settings.initialCache) {
    return;
  }

  logger.info('Running first time cache, this may take a few minutes');

  // cache trending
  await trending();

  // update initial cache
  await repo.Upsert({ ...settings, initialCache: true });
  logger.info('Finished updating cache');
};
