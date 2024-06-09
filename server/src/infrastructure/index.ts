import { ContainerBuilder } from 'diod';

import database from '@/infrastructure/database';
import generated from '@/infrastructure/generated';
import http from '@/infrastructure/http';
import logger from '@/infrastructure/logger';
import worker from '@/infrastructure/worker';

export default (builder: ContainerBuilder) => {
  generated(builder);
  http(builder);
  logger(builder);
  worker(builder);
  database(builder);
};
