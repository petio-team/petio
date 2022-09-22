import { Store } from "cache-manager";
import CacheDB from "@/models/cache/db";
import { RepositoryError } from "@/models/errors";

export type CacheResultFn = (error: Error, result: any) => void;

class MongooseStore implements Store {
  private db = new CacheDB();

  private expiry: number = 60 * 1000;

  constructor(args: any) {
    this.expiry = (args.expiry) ? args.expiry : 60 * 1000;
  }

  // eslint-disable-next-line class-methods-use-this
  result(fn?: CacheResultFn, error?: any, result?: any) {
      if (fn) {
          fn(error, result);
      }
      return result;
  }

  async get(key: any, options: any, fn: CacheResultFn) {
      try {
        const result = await this.db.Get(key);
        if (result.expiry && result.expiry < new Date()) {
          return await this.del(key, null, fn)
        }
        return this.result(fn, null, result.value);
      } catch (e) {
        if (e instanceof RepositoryError) {
          return this.result(fn);
        }
        return this.result(fn, e);
      }
  }

  async set(key: any, value: any, options: any, fn: CacheResultFn) {
    try {
      const ttl = options.expiry || this.expiry;
      const expiry = ttl > 0 ? new Date(Date.now() + options.ttl * 1000) : ttl;

      await this.db.Set({
        key,
        value,
        expiry,
      });
      return this.result(fn);
    } catch (e) {
      if (e instanceof RepositoryError) {
        return this.result(fn);
      }
      return this.result(fn, e);
    }
  }

  async del(key: any, options: any, fn: CacheResultFn) {
    try {
      this.db.Delete(key);
      return this.result(fn);
    } catch (e) {
      return this.result(fn, e);
    }
  }

  async reset(key: any, fn: any) {
    try {
      if (typeof key === "function") {
        // eslint-disable-next-line no-param-reassign
        fn = key;
        // eslint-disable-next-line no-param-reassign
        key = null;
      }
      await this.db.Reset();
      return fn ? fn() : undefined;
    } catch (e) {
      return this.result(fn, e);
    }
  }

  async keys(fn: any) {
    try {
      const results = await this.db.Keys();
      return this.result(fn, null, results);
    } catch (e) {
      return this.result(fn, e);
    }
  }
}

export default {
  create (args) {
    return new MongooseStore(args);
  },
}
