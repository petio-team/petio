import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { ArchiveEntity } from './entity';
import { ArchiveMapper } from './mapper';
import { ArchiveRepository } from './repository';
import { ArchiveSchema, ArchiveSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the ArchiveEntity using Mongoose.
*/
@Service()
export class ArchiveMongooseRepository
  extends MongooseBaseRepository<ArchiveEntity, ArchiveSchemaProps>
  implements ArchiveRepository
{
  /**
   * Represents a ArchiveMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The ArchiveMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: ArchiveMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Archive',
      ArchiveSchema,
    );
    super(model, mapper);
  }
}
