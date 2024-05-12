import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
import { RequestEntity } from './entity';
import { RequestMapper } from './mapper';
import { RequestRepository } from './repository';
import { RequestSchema, RequestSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the RequestEntity using Mongoose.
*/
@Service()
export class RequestMongooseRepository
  extends MongooseBaseRepository<RequestEntity, RequestSchemaProps>
  implements RequestRepository
{
  /**
   * Represents a RequestMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The RequestMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: RequestMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Request',
      RequestSchema,
    );
    super(model, mapper);
  }
}
