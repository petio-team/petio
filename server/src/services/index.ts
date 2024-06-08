import cluster from 'cluster';
import { ContainerBuilder } from 'diod';

import cache from '@/services/cache';
import company from '@/services/company';
import cron from '@/services/cron';
import discovery from '@/services/discovery';
import filter from '@/services/filter';
import migration from '@/services/migration';
import movie from '@/services/movie';
import network from '@/services/network';
import person from '@/services/person';
import scanner from '@/services/scanner';
import settings from '@/services/settings';
import setup from '@/services/setup';
import show from '@/services/show';
import user from '@/services/user';

export default (builder: ContainerBuilder) => {
  cache(builder);
  company(builder);
  if (cluster.isWorker && process.env.job) {
    cron(builder);
  }
  discovery(builder);
  filter(builder);
  network(builder);
  person(builder);
  scanner(builder);
  migration(builder);
  movie(builder);
  setup(builder);
  show(builder);
  settings(builder);
  user(builder);
};
