import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infrastructure/database/base-repository';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';

import { MediaLibraryEntity } from './entity';
import { MediaLibraryMapper } from './mapper';
import { MediaLibraryRepository } from './repository';
import { MediaLibrarySchema, MediaLibrarySchemaProps } from './schema';

/**
 * Represents a repository for interacting with the MediaLibraryEntity using Mongoose.
 */
@Service()
export class MediaLibraryMongooseRepository
  extends MongooseBaseRepository<MediaLibraryEntity, MediaLibrarySchemaProps>
  implements MediaLibraryRepository
{
  /**
   * Represents a MediaLibraryMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The MediaLibraryMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: MediaLibraryMapper,
  ) {
    const model = connection
      .getOrThrow()
      .model('MediaLibrary', MediaLibrarySchema, 'libraries');
    super(model, mapper);
  }

  /**
   * Updates a media library entity in the database.
   * @param entity - The media library entity to update.
   * @returns A Promise that resolves to the updated media library entity.
   * @throws Error if the media library entity with the specified id is not found.
   */
  async update(entity: MediaLibraryEntity): Promise<MediaLibraryEntity> {
    const { id, uuid, ...update } = this.mapper.toPeristence(entity);
    const updated = await this.model().findOneAndUpdate({ uuid }, update, {
      new: true,
    });
    if (!updated) {
      throw new Error(`MediaLibrary with id ${id} not found`);
    }
    return this.mapper.toEntity(updated);
  }
}
