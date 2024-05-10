import { MongooseRepository } from "@/infrastructure/database/repository";
import { Service } from "diod";
import { ShowEntity } from "./entity";
import { ShowSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Show entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `ShowEntity` and `ShowSchema`.
 */
@Service()
export abstract class ShowRepository extends MongooseRepository<ShowEntity, ShowSchemaProps> {}
