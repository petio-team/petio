import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
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

  /**
   * Finds a notification entity by the provided entity or creates a new one if it does not exist.
   *
   * @param entity - The notification entity to find or create.
   * @returns A promise that resolves to the found or created notification entity.
   */
  async findOneOrCreate(entity: NotificationEntity): Promise<NotificationEntity> {
    const found = await this.findOne({ name: entity.name });
    if (found.isNone()) {
      return this.create(entity);
    }
    return found.unwrap();
  }
}
