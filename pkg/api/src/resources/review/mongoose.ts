import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { ReviewEntity } from './entity';
import { ReviewMapper } from './mapper';
import { ReviewRepository } from './repository';
import { ReviewSchema, ReviewSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the ReviewEntity using Mongoose.
*/
@Service()
export class ReviewMongooseRepository
  extends MongooseBaseRepository<ReviewEntity, ReviewSchemaProps>
  implements ReviewRepository
{
  /**
   * Represents a ReviewMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The ReviewMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: ReviewMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Review',
      ReviewSchema,
    );
    super(model, mapper);
  }
}
