import { Store } from "cache-manager";
import CacheDB from "@/models/cache/db";

export default class MongooseStore implements Store {
  private db = new CacheDB();

  private expiry: number = 60 * 1000;

  constructor(args: any) {
    this.expiry = (args.expiry) ? args.expiry : 60 * 1000;
  }

  async get(key: any): Promise<any> {
    const result = await this.db.Get(key);
    if (!result) {
      return {};
    }
    if (result.expiry && result.expiry < new Date()) {
      return this.del(key);
    }
    return result.value;
  }

  async set(key: any, value: any, options: any): Promise<void> {
    const expiry = options && options.ttl > 0 ? new Date(Date.now() + options.ttl * 1000) : new Date(this.expiry);

    this.db.Set({
      key,
      value,
      expiry,
    });
  }

  async del(key: any): Promise<void> {
    this.db.Delete(key);
  }

  async reset(): Promise<void> {
    this.db.Reset();
  }

  async keys(): Promise<string[]> {
    return this.db.Keys();
  }

  async mget(...args: string[]): Promise<unknown[]> {
      return Promise.allSettled(
        args.map((x) => this.db.Get(x))
      );
  }

  async mdel(...args: string[]): Promise<void> {
    for (const key of args) {
      this.db.Delete(key);
    }
  }

  async mset(args, ttl?) {
    const opt = { ttl: ttl !== undefined ? ttl : this.expiry } as const;
    for (const [key, value] of args) {
      this.set(key, value, opt);
    }
  }

  async ttl(key: string): Promise<number> {
      const value = await this.db.Get(key);
      return value.expiry.getTime();
  }
}
