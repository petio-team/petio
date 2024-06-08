import {
  MemoryCache,
  MultiCache,
  createCache,
  memoryStore,
  multiCaching,
} from 'cache-manager';
import { Service } from 'diod';

import { CacheProvider } from '@/services/cache/cache-provider';

import MongooseStore, { MongooseCache } from './store/mongoose';

/**
 * Represents a cache manager provider that implements the CacheProvider interface.
 */
@Service()
export class CacheManagerProvider implements CacheProvider {
  // memoryCache represents an in-memory cache store
  private memoryCache: MemoryCache;

  // mongooseCache represents a mongoose database cache store
  private mongooseCache: MongooseCache;

  // cache represents a multi-cache that combines multiple cache stores
  private cache: MultiCache;

  /**
   * Creates an instance of CacheManagerProvider.
   */
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

  /**
   * Retrieves the value associated with the specified key from the cache.
   * @param key - The key to retrieve the value for.
   * @returns A Promise that resolves to the value associated with the key, or undefined if the key is not found.
   */
  public async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  /**
   * Sets the value associated with the specified key in the cache.
   * @param key - The key to set the value for.
   * @param value - The value to set.
   * @param ttl - Optional. The time-to-live for the key-value pair in seconds.
   * @returns A Promise that resolves when the value is set in the cache.
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Retrieves the value associated with the specified key from the cache, or executes the provided function and caches its result.
   * @param key - The key to retrieve the value for or cache the function result under.
   * @param fn - The function to execute if the key is not found in the cache.
   * @param ttl - Optional. The time-to-live for the key-value pair in seconds.
   * @returns A Promise that resolves to the value associated with the key, either from the cache or the result of executing the function.
   */
  public async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    return this.cache.wrap(key, fn, ttl);
  }

  /**
   * Resets the cache, removing all key-value pairs.
   * @returns A Promise that resolves when the cache is reset.
   */
  public async reset(): Promise<void> {
    return this.cache.reset();
  }

  /**
   * Deletes the value associated with the specified key from the cache.
   * @param key - The key to delete the value for.
   * @returns A Promise that resolves when the value is deleted from the cache.
   */
  public async del(key: string): Promise<void> {
    return this.cache.del(key);
  }
}
