import { ContainerBuilder } from 'diod';

import database from '@/infrastructure/database';
import logger from '@/infrastructure/logger';
import tmdb from '@/infrastructure/tmdb';
import worker from '@/infrastructure/worker';

export default (builder: ContainerBuilder) => {
  logger(builder);
  worker(builder);
  database(builder);
  tmdb(builder);
};
