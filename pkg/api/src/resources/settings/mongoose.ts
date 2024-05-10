import { Service } from 'diod';

import { MongooseBaseRepository } from '@/infra/database/base-repository';
import { MongooseDatabaseConnection } from '@/infra/database/connection';
import { SettingsEntity } from './entity';
import { SettingsMapper } from './mapper';
import { SettingsRepository } from './repository';
import { SettingsSchema, SettingsSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the SettingsEntity using Mongoose.
*/
@Service()
export class SettingsMongooseRepository
  extends MongooseBaseRepository<SettingsEntity, SettingsSchemaProps>
  implements SettingsRepository
{
  /**
   * Represents a SettingsMongooseRepository instance.

   * @param connection - The MongooseDatabaseConnection used to connect to the database.
   * @param mapper - The SettingsMapper used to map between entity and schema.
   */
  constructor(
    connection: MongooseDatabaseConnection,
    mapper: SettingsMapper,
  ) {
    const model = connection.getOrThrow().model(
      'Settings',
      SettingsSchema,
    );
    super(model, mapper);
  }

  /**
   * Finds or creates a settings entity.
   *
   * @param settings - The settings entity to find or create.
   * @returns A promise that resolves to the settings entity.
   */
  async findOrCreate(settings: SettingsEntity): Promise<SettingsEntity> {
    const found = await this.findOne({});
    if (found.isNone()) {
      return this.create(settings);
    }
    return found.unwrap();
  }
}
