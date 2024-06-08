/**
 * Abstract class representing a cache provider.
 */
export abstract class CacheProvider {
  /**
   * Retrieves a value from the cache.
   * @param key - The key associated with the value.
   * @returns A promise that resolves to the value, or undefined if the key is not found.
   */
  public abstract get<T>(key: string): Promise<T | undefined>;

  /**
   * Sets a value in the cache.
   * @param key - The key associated with the value.
   * @param value - The value to be stored in the cache.
   * @param ttl - Optional. The time-to-live (TTL) for the cached value in seconds.
   * @returns A promise that resolves when the value is successfully set in the cache.
   */
  public abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Retrieves a value from the cache, or executes a function to obtain the value if it is not found.
   * @param key - The key associated with the value.
   * @param fn - The function to be executed if the value is not found in the cache.
   * @param ttl - Optional. The time-to-live (TTL) for the cached value in seconds.
   * @returns A promise that resolves to the value.
   */
  public abstract wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T>;

  /**
   * Resets the cache, removing all stored values.
   * @returns A promise that resolves when the cache is successfully reset.
   */
  public abstract reset(): Promise<void>;

  /**
   * Deletes a value from the cache.
   * @param key - The key associated with the value to be deleted.
   * @returns A promise that resolves when the value is successfully deleted from the cache.
   */
  public abstract del(key: string): Promise<void>;
}
