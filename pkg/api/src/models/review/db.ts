import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Review } from './dto';
import { IReviewRepository } from './repo';
import { ReviewSchema } from './schema';

export class ReviewDB implements IReviewRepository {
  private model = getModelForClass(ReviewSchema);

  async GetAll(): Promise<Review[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Review> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get review by id with id: ${id}`);
    }

    return result.toObject();
  }

  async GetByExternalId(tmdb_id: number): Promise<Review> {
    const result = await this.model.findOne({ tmdb_id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get review by external id with id: ${tmdb_id}`,
      );
    }

    return result.toObject();
  }

  async Create(review: Review): Promise<Review> {
    const result = await this.model.create(review);
    if (!result.isNew) {
      throw new RepositoryError(`failed to create review`);
    }

    return result.toObject();
  }

  async UpdateById(review: Partial<Review>): Promise<Review> {
    const { id, ...update } = review;
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
      throw new RepositoryError(`failed to update by id with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(
        `failed to deleted review by id with id: ${id}`,
      );
    }
  }
}
