import { Cache, Milliseconds, Store } from 'cache-manager';

import { getFromContainer } from '@/infrastructure/container/container';
import { CacheEntity } from '@/resources/cache/entity';
import { CacheRepository } from '@/resources/cache/repository';

const defaultExpiry: number = 60 * 1000;

export default class MongooseStore implements Store {
  async get<T>(key: any): Promise<T | undefined> {
    const result = await getFromContainer(CacheRepository).findOne({ key });
    if (result.isNone()) {
      return undefined;
    }
    const cache = result.unwrap();
    if (cache.expires && cache.expires < new Date()) {
      await this.del(key);
      return undefined;
    }
    return cache.value;
  }

  async set<T>(key: string, value: T, ttl?: Milliseconds): Promise<void> {
    const expires =
      ttl && ttl > 0
        ? new Date(Date.now() + ttl)
        : new Date(Date.now() + defaultExpiry);

    const entity = CacheEntity.create({
      key,
      value,
      expires,
    });
    await getFromContainer(CacheRepository).upsert(entity);
  }

  async del(key: any): Promise<void> {
    await getFromContainer(CacheRepository).deleteMany({ key });
  }

  async reset(): Promise<void> {
    await getFromContainer(CacheRepository).deleteMany({});
  }

  async keys(pattern?: string): Promise<string[]> {
    const keyResult = await getFromContainer(CacheRepository).findAll({
      pattern,
    });
    return keyResult.map((x) => x.key);
  }

  async mget(...args: string[]): Promise<unknown[]> {
    return Promise.allSettled(
      args.map((x) => getFromContainer(CacheRepository).findOne({ x })),
    );
  }

  async mdel(...args: string[]): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of args) {
      getFromContainer(CacheRepository).deleteMany({ key });
    }
  }

  async mset(args: Array<[string, unknown]>, ttl?: Milliseconds) {
    const expiry = ttl !== undefined ? ttl : defaultExpiry;
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of args) {
      this.set(key, value, expiry);
    }
  }

  async ttl(key: string): Promise<number> {
    const value = await getFromContainer(CacheRepository).findOne({ key });
    return value.unwrap().expires.getTime();
  }
}
export type MongooseCache = Cache<MongooseStore>;
