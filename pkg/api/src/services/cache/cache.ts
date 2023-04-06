import { caching, multiCaching, MemoryCache, Cache, MultiCache } from 'cache-manager';
import MongooseStore from "../store/mongoose";

class CacheManager
{
  // memoryCache represents an in memory cache store
  private memoryCache: Promise<MemoryCache>;

  // mongooseCache represents a mongoose database cache store
  private mongooseCache: Promise<Cache<MongooseStore>>;

  constructor() {
    this.memoryCache = caching('memory', {
      max: 1000,
      ttl: 3600,
    });
    this.mongooseCache = caching(
      new MongooseStore({}),
    );
  }

  private async cache(): Promise<MultiCache> {
    return multiCaching([await this.memoryCache, await this.mongooseCache]);
  }

  public async get(key: string): Promise<unknown> {
    const cache = await this.cache();
    return cache.get(key);
  }

  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const cache = await this.cache();
    cache.set(key, value, ttl);
  }

  public async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cache = await this.cache();
    return cache.wrap(key, fn, ttl);
  }

  public async reset(): Promise<void> {
    const cache = await this.cache();
    cache.reset();
  }

  public async del(key: string): Promise<void> {
    const cache = await this.cache();
    cache.del(key);
  }
}

export default new CacheManager;
