import { Connection, connect } from 'mongoose';

import { config } from '@/config/index';
import logger from '@/infra/logger/logger';

export default async (): Promise<Connection['db']> => {
  const connection = await connect(config.get('db.url'), {
    autoCreate: true,
    autoIndex: true,
  }).catch((error) => {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  });
  return connection.connection.db;
};
