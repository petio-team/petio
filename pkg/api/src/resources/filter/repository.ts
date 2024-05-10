import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { FilterEntity } from "./entity";
import { FilterSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Filter entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `FilterEntity` and `FilterSchema`.
 */
@Service()
export abstract class FilterRepository extends MongooseRepository<FilterEntity, FilterSchemaProps> {}
