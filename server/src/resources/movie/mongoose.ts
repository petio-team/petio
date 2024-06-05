import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';

import { MovieEntity } from './entity';
import { MovieMapper } from './mapper';
import { MovieRepository } from './repository';
import { MovieSchema, MovieSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the MovieEntity using Mongoose.
 */
@Service()
export class MovieMongooseRepository
  extends MongooseBaseRepository<MovieEntity, MovieSchemaProps>
  implements MovieRepository
{
  /**
   * Represents a MovieMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The MovieMapper used to map between entity and schema.
   */
  constructor(connection: MongooseDatabaseConnection, mapper: MovieMapper) {
    const model = connection.getOrThrow().model('Movie', MovieSchema);
    super(model, mapper);
  }

  /**
   * @param entity The movie entity to update or create.
   * Updates or creates a movie entity.
   * @returns A promise that resolves to the updated or created movie entity.
   */
  async updateOrCreate(entity: MovieEntity): Promise<MovieEntity> {
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
