import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
import { IssueEntity } from './entity';
import { IssueMapper } from './mapper';
import { IssueRepository } from './repository';
import { IssueSchema, IssueSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the IssueEntity using Mongoose.
*/
@Service()
export class IssueMongooseRepository
  extends MongooseBaseRepository<IssueEntity, IssueSchemaProps>
  implements IssueRepository
{
  /**
   * Represents a IssueMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The IssueMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: IssueMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Issue',
      IssueSchema,
    );
    super(model, mapper);
  }
}
