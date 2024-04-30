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
      'media-servers',
    );
    super(model, mapper);
  }
}
