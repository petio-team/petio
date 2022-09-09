import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Request } from './dto';
import { IRequestRepository } from './repo';
import { RequestSchema } from './schema';

export class RequestDB implements IRequestRepository {
  private model = getModelForClass(RequestSchema);

  async GetAll(): Promise<Request[]> {
    const results = await this.model.find({}).exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Request> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`no request found with id: ${id}`);
    }

    return result.toObject();
  }

  async Create(request: Request): Promise<Request> {
    const result = await this.model.create(request);
    if (!result.isNew) {
      throw new RepositoryError(`failed to create request`);
    }

    return result.toObject();
  }

  async UpdateById(request: Request): Promise<Request> {
    const { id, ...update } = request;
    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        update,
      )
      .exec();
    if (!result) {
      throw new RepositoryError(`failed to update request with id: ${id}`);
    }

    return result.toObject();
  }

  async RemoveById(id: string): Promise<Request> {
    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        {
          deletedAt: Date.now(),
        },
      )
      .exec();
    if (!result) {
      throw new RepositoryError(`failed to remove request with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model
      .deleteOne({
        id,
      })
      .exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete request with id: ${id}`);
    }
  }
}
