import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';

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
  constructor(connection: MongooseDatabaseConnection, mapper: ShowMapper) {
    const model = connection.getOrThrow().model('Show', ShowSchema);
    super(model, mapper);
  }

  /**
   * @param entity The show entity to update or create.
   * Updates or creates a show entity.
   * @returns A promise that resolves to the updated or created show entity.
   */
  async updateOrCreate(entity: ShowEntity): Promise<ShowEntity> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, ...rest } = this.mapper.toPeristence(entity);
    const result = await this.repository
      .findOneAndUpdate({ tmdb_id: rest.tmdb_id }, rest, {
        upsert: true,
        new: true,
      })
      .lean()
      .exec();
    return this.mapper.toEntity(result);
  }
}
