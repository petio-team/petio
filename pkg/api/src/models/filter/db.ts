import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Filter } from './dto';
import { IFilterRepository } from './repo';
import { FilterSchema } from './schema';

export class FilterDB implements IFilterRepository {
  private model = getModelForClass(FilterSchema);

  async GetAll(): Promise<Filter[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Filter> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get filter by id with id: ${id}`);
    }

    return result.toObject();
  }

  async Create(filter: Filter): Promise<Filter> {
    const result = await this.model.create(filter);
    if (!result) {
      throw new RepositoryError(`failed to create filter`);
    }

    return result.toObject();
  }

  async UpdateById(filter: Partial<Filter>): Promise<Filter> {
    const { id, ...update } = filter;
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
      throw new RepositoryError(`failed to update fitler by id with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete by id with id: ${id}}`);
    }
  }
}
