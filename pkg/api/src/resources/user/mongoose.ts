import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
import { UserEntity } from './entity';
import { UserMapper } from './mapper';
import { UserRepository } from './repository';
import { UserSchema, UserSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the UserEntity using Mongoose.
*/
@Service()
export class UserMongooseRepository
  extends MongooseBaseRepository<UserEntity, UserSchemaProps>
  implements UserRepository
{
  /**
   * Represents a UserMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The UserMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: UserMapper,
  ) {
    const model = connection.getOrThrow().model(
      'User',
      UserSchema,
    );
    super(model, mapper);
  }

  /**
   * Finds or creates a user entity.
   *
   * @param user - The user entity to find or create.
   * @returns The found or created user entity.
   */
  async findOrCreate(user: UserEntity): Promise<UserEntity> {
    const found = await this.findOne({ email: user.email });
    if (found.isNone()) {
      return this.create(user);
    }
    return found.unwrap();
  }
}
