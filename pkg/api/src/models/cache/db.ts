import CacheModel from '../cache';
import { RepositoryError } from '../errors';
import { Cache } from './dto';
import ICacheRepository from './repository';

export default class CacheDB implements ICacheRepository {
  private model = CacheModel;

  async Set(cache: Cache): Promise<void> {
    const result = await this.model
      .updateOne(
        {
          key: cache.key,
        },
        {
          value: cache.value,
          expiry: cache.expiry,
        },
        {
          upsert: true,
        },
      )
      .exec();
    if (!result) {
      throw new RepositoryError(
        `failed to set cache key with key: ${cache.key}`,
      );
    }
  }

  async Get(key: string): Promise<Cache> {
    const result = await this.model
      .findOne({
        key,
      })
      .exec();
    if (!result) {
      throw new RepositoryError(`failed to get cache for key ${key}`);
    }

    return result.toObject();
  }

  async Delete(key: string): Promise<void> {
    const result = await this.model
      .deleteOne({
        key,
      })
      .exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete cache with key: ${key}`);
    }
  }

  async Reset(): Promise<void> {
    this.model.deleteMany({});
  }

  async Keys(): Promise<string[]> {
    const now = new Date();
    const results = await this.model.find({});
    // eslint-disable-next-line no-underscore-dangle
    return (
      results
        .filter((r) => !r.expiry || r.expiry > now)
        // eslint-disable-next-line no-underscore-dangle
        .map((r) => r.key)
    );
  }
}
