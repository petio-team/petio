import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { ImdbEntity } from './entity';
import { ImdbMapper } from './mapper';
import { ImdbRepository } from './repository';
import { ImdbSchema, ImdbSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the ImdbEntity using Mongoose.
*/
@Service()
export class ImdbMongooseRepository
  extends MongooseBaseRepository<ImdbEntity, ImdbSchemaProps>
  implements ImdbRepository
{
  /**
   * Represents a ImdbMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The ImdbMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: ImdbMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Imdb',
      ImdbSchema,
    );
    super(model, mapper);
  }
}
