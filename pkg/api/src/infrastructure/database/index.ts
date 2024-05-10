import { ContainerBuilder } from 'diod';

import { MongooseDatabaseConnection } from './connection';
import { MongooseDatabase } from './mongoose';

export default (builder: ContainerBuilder) => {
  builder
    .register(MongooseDatabaseConnection)
    .use(MongooseDatabase)
    .asSingleton();
};
