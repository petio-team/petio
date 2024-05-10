import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
import { DiscoveryEntity } from './entity';
import { DiscoveryMapper } from './mapper';
import { DiscoveryRepository } from './repository';
import { DiscoverySchema, DiscoverySchemaProps } from './schema';

/**
 * Represents a repository for interacting with the DiscoveryEntity using Mongoose.
*/
@Service()
export class DiscoveryMongooseRepository
  extends MongooseBaseRepository<DiscoveryEntity, DiscoverySchemaProps>
  implements DiscoveryRepository
{
  /**
   * Represents a DiscoveryMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The DiscoveryMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: DiscoveryMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Discovery',
      DiscoverySchema,
    );
    super(model, mapper);
  }
}
