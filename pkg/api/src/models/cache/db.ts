import { getModelForClass } from "@typegoose/typegoose";
import { RepositoryError } from "../errors";
import { Cache } from "./dto";
import ICacheRepository from "./repository";
import CacheSchema from "./schema";

export default class CacheDB implements ICacheRepository {
  private model = getModelForClass(CacheSchema);

  async Set(cache: Cache): Promise<void> {
    const result = await this.model.updateOne(
      {
      _id: cache.key,
      },
      {
        value: cache.value,
      },
      {
        upsert: true,
      }
    ).exec();
    if (!result) {
      throw new RepositoryError(`failed to set cache key with key: ${cache.key}`);
    }
  }

  async Get(key: any): Promise<Cache> {
    const result = await this.model.findOne(
      {
        _id: key,
      }
    ).exec();
    if (!result) {
      throw new RepositoryError(`failed to get cache for key ${key}`);
    }

    return result.toObject();
  }

  async Delete(key: any): Promise<void> {
    const result = await this.model.deleteOne(
      {
        _id: key,
      }
    ).exec();
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
    return results.filter((r) => (!r.expiry || r.expiry > now)).map((r) => r._id);
  }

}
