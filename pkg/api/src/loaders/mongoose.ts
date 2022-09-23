import { connect, Connection } from 'mongoose';
import { container } from 'tsyringe';
import { Logger } from 'winston';

import { config } from '@/config/index';

export type DB = Connection["db"];

export default async (): Promise<DB | null> => {
  const connection = await connect(config.get('db.url'), {
    autoCreate: true,
    autoIndex: true,
  }).catch((error) => {
    container.resolve<Logger>('Logger').error(error);
    process.exit(1);
  });
  if (!connection) {
    return null;
  }

  return connection.connection.db;
};
