import {
  createCache,
  MemoryCache,
  MultiCache,
  multiCaching,
  memoryStore,
} from 'cache-manager';

import { Service } from 'diod';
import MongooseStore, { MongooseCache } from './store/mongoose';

@Service()
export class CacheService {
  // memoryCache represents an in memory cache store
  private memoryCache: MemoryCache;

  // mongooseCache represents a mongoose database cache store
  private mongooseCache: MongooseCache;

  //
  private cache: MultiCache;

  constructor() {
    this.memoryCache = createCache(memoryStore(), {
      max: 1000,
      ttl: 3600,
    });
    this.mongooseCache = createCache(new MongooseStore(), {
      ttl: 3600,
    });
    this.cache = multiCaching([this.memoryCache, this.mongooseCache]);
  }

  public async get(key: string): Promise<unknown> {
    return this.cache.get(key);
  }

  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    return this.cache.set(key, value, ttl);
  }

  public async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    return this.cache.wrap(key, fn, ttl);
  }

  public async reset(): Promise<void> {
    return this.cache.reset();
  }

  public async del(key: string): Promise<void> {
    return this.cache.del(key);
  }
}

