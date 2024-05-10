import cluster from 'cluster';
import { ContainerBuilder } from 'diod';

import cache from '@/services/cache';
import cron from '@/services/cron';
import migration from '@/services/migration';
import scanner from '@/services/scanner';
import settings from '@/services/settings';

export default (builder: ContainerBuilder) => {
  cache(builder);
  if (cluster.isWorker && process.env.job) {
    cron(builder);
  }
  scanner(builder);
  migration(builder);
  settings(builder);
};
