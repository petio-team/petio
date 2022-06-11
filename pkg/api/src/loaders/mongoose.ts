import { Db } from 'mongodb';
import { connect } from 'mongoose';

import { config } from '@/config/index';

export default async (): Promise<Db> => {
  const connection = await connect(config.get('db.url'), {
    autoCreate: true,
    autoIndex: true,
  });

  return connection.connection.db;
};
