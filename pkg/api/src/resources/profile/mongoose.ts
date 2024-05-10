import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { ProfileEntity } from './entity';
import { ProfileMapper } from './mapper';
import { ProfileRepository } from './repository';
import { ProfileSchema, ProfileSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the ProfileEntity using Mongoose.
*/
@Service()
export class ProfileMongooseRepository
  extends MongooseBaseRepository<ProfileEntity, ProfileSchemaProps>
  implements ProfileRepository
{
  /**
   * Represents a ProfileMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The ProfileMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: ProfileMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Profile',
      ProfileSchema,
    );
    super(model, mapper);
  }
}
