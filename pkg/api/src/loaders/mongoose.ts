import { Connection, connect } from 'mongoose';

import { DATABASE_URL } from '@/infra/config/env';
import logger from '@/infra/logger/logger';

export default async (): Promise<Connection['db']> => {
  const connection = await connect(DATABASE_URL, {
    autoCreate: true,
    autoIndex: true,
  }).catch((error) => {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  });
  return connection.connection.db;
};
