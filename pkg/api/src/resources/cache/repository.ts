import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { CacheEntity } from "./entity";
import { CacheSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Cache entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `CacheEntity` and `CacheSchema`.
 */
@Service()
export abstract class CacheRepository extends MongooseRepository<CacheEntity, CacheSchemaProps> {
  abstract upsert(entity: CacheEntity): Promise<CacheEntity>;
}
