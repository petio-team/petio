import { ContainerBuilder } from 'diod';

import database from '@/infrastructure/database';
import fanart from '@/infrastructure/fanart';
import http from '@/infrastructure/http';
import logger from '@/infrastructure/logger';
import servarr from '@/infrastructure/servarr';
import tmdb from '@/infrastructure/tmdb';
import worker from '@/infrastructure/worker';

export default (builder: ContainerBuilder) => {
  fanart(builder);
  http(builder);
  logger(builder);
  worker(builder);
  database(builder);
  tmdb(builder);
  servarr(builder);
};
