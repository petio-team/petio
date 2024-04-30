import { ContainerBuilder } from 'diod';

import database from '@/infra/database';
import logger from '@/infra/logger';
import worker from '@/infra/worker';

export default (builder: ContainerBuilder) => {
  logger(builder);
  worker(builder);
  database(builder);
};
