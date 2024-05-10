import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { DownloaderEntity } from './entity';
import { DownloaderMapper } from './mapper';
import { DownloaderRepository } from './repository';
import { DownloaderSchema, DownloaderSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the DownloaderEntity using Mongoose.
*/
@Service()
export class DownloaderMongooseRepository
  extends MongooseBaseRepository<DownloaderEntity, DownloaderSchemaProps>
  implements DownloaderRepository
{
  /**
   * Represents a DownloaderMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The DownloaderMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: DownloaderMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Downloader',
      DownloaderSchema,
    );
    super(model, mapper);
  }

  /**
   * Finds or creates a downloader entity.
   *
   * @param downloader - The downloader entity to find or create.
   * @returns A promise that resolves to the downloader entity.
   */
  async findOrCreate(downloader: DownloaderEntity): Promise<DownloaderEntity> {
    const found = await this.findOne({ url: downloader.url });
    if (found.isNone()) {
      return this.create(downloader);
    }
    return found.unwrap();
  }
}
