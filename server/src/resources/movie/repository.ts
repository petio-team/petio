import { Service } from 'diod';

import { MongooseRepository } from '@/infrastructure/database/repository';

import { MovieEntity } from './entity';
import { MovieSchemaProps } from './schema';

/**
 * Represents a repository for interacting with the Movie entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `MovieEntity` and `MovieSchema`.
 */
@Service()
export abstract class MovieRepository extends MongooseRepository<
  MovieEntity,
  MovieSchemaProps
> {
  abstract updateOrCreate(entity: MovieEntity): Promise<MovieEntity>;
}
