import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { ShowEntity } from './entity';
import { ShowMapper } from './mapper';
import { ShowRepository } from './repository';
import { ShowSchema, ShowSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the ShowEntity using Mongoose.
*/
@Service()
export class ShowMongooseRepository
  extends MongooseBaseRepository<ShowEntity, ShowSchemaProps>
  implements ShowRepository
{
  /**
   * Represents a ShowMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The ShowMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: ShowMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Show',
      ShowSchema,
    );
    super(model, mapper);
  }
}
