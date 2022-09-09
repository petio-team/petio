import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { IMDB } from './dto';
import { IIMDBRepository } from './repo';
import { IMDBSchema } from './schema';

export class IMDBDB implements IIMDBRepository {
  private model = getModelForClass(IMDBSchema);

  async GetAll(): Promise<IMDB[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<IMDB> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get IMDB by id with id: ${id}`);
    }

    return result.toObject();
  }

  async GetByImdbId(imdb_id: string): Promise<IMDB> {
    const result = await this.model.findOne({ imdb_id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get IMDB by imdb id with id: ${imdb_id}`,
      );
    }

    return result.toObject();
  }

  async Create(imdb: IMDB): Promise<IMDB> {
    const result = await this.model.create(imdb);
    if (!result) {
      throw new RepositoryError(`failed to create IMDB`);
    }

    return result.toObject();
  }

  async UpdateById(imdb: Partial<IMDB>): Promise<IMDB> {
    const { id, ...update } = imdb;
    if (id === undefined) {
      throw new RepositoryError(`invalid or missing id field`);
    }

    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        update,
      )
      .exec();
    if (!result) {
      throw new RepositoryError(`failed to update IMDB by id with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to delete IMDB by id with id: ${id}`);
    }
  }
}
