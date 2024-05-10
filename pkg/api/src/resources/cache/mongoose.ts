import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { CacheEntity } from './entity';
import { CacheMapper } from './mapper';
import { CacheRepository } from './repository';
import { CacheSchema, CacheSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the CacheEntity using Mongoose.
*/
@Service()
export class CacheMongooseRepository
  extends MongooseBaseRepository<CacheEntity, CacheSchemaProps>
  implements CacheRepository
{
  /**
   * Represents a CacheMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The CacheMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: CacheMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Cache',
      CacheSchema,
    );
    super(model, mapper);
  }

  async upsert(entity: CacheEntity): Promise<CacheEntity> {
    const { key, value, expires } = entity.getProps();
    const record = await this.model().findOneAndUpdate({
      key,
    }, {
      id: entity.id,
      key,
      value,
      expires,
    }, {
      upsert: true,
      new: true,
    });
    return this.mapper.toEntity(record);
  }
}
