import { MongooseBaseRepository } from '@/infra/database/base-repository';

import { Service } from 'diod';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { MediaServerEntity } from './entity';
import { MediaServerMapper } from './mapper';
import { MediaServerRepository } from './repository';
import { MediaServerSchema, MediaServerSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the MediaServerEntity using Mongoose.
*/
@Service()
export class MediaServerMongooseRepository
  extends MongooseBaseRepository<MediaServerEntity, MediaServerSchemaProps>
  implements MediaServerRepository
{
  /**
   * Represents a MediaServerMongooseRepository instance.
   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The MediaServerMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: MediaServerMapper,
  ) {
    const model = connection.getOrThrow().model(
      'MediaServer',
      MediaServerSchema,
      'media_servers'
    );
    super(model, mapper);
  }

  /**
   * Finds a media server entity by the provided entity or creates a new one if it does not exist.
   *
   * @param entity - The media server entity to find or create.
   * @returns A promise that resolves to the found or created media server entity.
   */
  async findOneOrCreate(entity: MediaServerEntity): Promise<MediaServerEntity> {
    const found = await this.findOne({ url: entity.url });
    if (found.isNone()) {
      return this.create(entity);
    }
    return found.unwrap();
  }
}
