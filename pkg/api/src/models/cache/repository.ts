import { Cache } from "./dto";

export default interface ICacheRepository {
  Set(cache: Cache): Promise<void>;
  Get(key: any): Promise<Cache>;
  Delete(key: any): Promise<void>;
  Reset(): Promise<void>;
  Keys(): Promise<string[]>;
}
