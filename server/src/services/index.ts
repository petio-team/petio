import cluster from 'cluster';
import { ContainerBuilder } from 'diod';

import cache from '@/services/cache';
import cron from '@/services/cron';
import migration from '@/services/migration';
import movie from '@/services/movie';
import scanner from '@/services/scanner';
import settings from '@/services/settings';
import setup from '@/services/setup';
import show from '@/services/show';
import user from '@/services/user';

export default (builder: ContainerBuilder) => {
  cache(builder);
  if (cluster.isWorker && process.env.job) {
    cron(builder);
  }
  scanner(builder);
  migration(builder);
  movie(builder);
  setup(builder);
  show(builder);
  settings(builder);
  user(builder);
};
