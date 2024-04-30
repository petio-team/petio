import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { NotificationEntity } from './entity';
import { NotificationMapper } from './mapper';
import { NotificationRepository } from './repository';
import { NotificationSchema, NotificationSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the NotificationEntity using Mongoose.
*/
@Service()
export class NotificationMongooseRepository
  extends MongooseBaseRepository<NotificationEntity, NotificationSchemaProps>
  implements NotificationRepository
{
  /**
   * Represents a NotificationMongooseRepository instance.
   *
   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The NotificationMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: NotificationMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Notification',
      NotificationSchema,
      'notifications',
    );
    super(model, mapper);
  }
}
