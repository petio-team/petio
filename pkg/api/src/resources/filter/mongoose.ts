import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { FilterEntity } from './entity';
import { FilterMapper } from './mapper';
import { FilterRepository } from './repository';
import { FilterSchema, FilterSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the FilterEntity using Mongoose.
*/
@Service()
export class FilterMongooseRepository
  extends MongooseBaseRepository<FilterEntity, FilterSchemaProps>
  implements FilterRepository
{
  /**
   * Represents a FilterMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The FilterMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: FilterMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Filter',
      FilterSchema,
    );
    super(model, mapper);
  }
}
