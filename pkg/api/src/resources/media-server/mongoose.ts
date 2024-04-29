import mongoose from 'mongoose';

import { MongooseBaseRepository } from '@/infra/database/base-repository';

import { Service } from 'diod';
import { MediaServerEntity } from './entity';
import { MediaServerMapper } from './mapper';
import { MediaServerRepository } from './repository';
import { MediaServerSchema, MediaServerSchemaProps } from './schema';

@Service()
export class MediaServerMongooseRepository
  extends MongooseBaseRepository<MediaServerEntity, MediaServerSchemaProps>
  implements MediaServerRepository
{
  /**
   * Represents a MediaServerMongooseRepository instance.
   */
  constructor(
    mapper: MediaServerMapper,
  ) {
    const model = mongoose.model(
      'MediaServer',
      MediaServerSchema,
      'media-servers',
    );
    super(model, mapper);
  }
}
