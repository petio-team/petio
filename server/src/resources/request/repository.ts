import { MongooseRepository } from "@/infrastructure/database/repository";
import { Service } from "diod";
import { RequestEntity } from "./entity";
import { RequestSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Request entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `RequestEntity` and `RequestSchema`.
 */
@Service()
export abstract class RequestRepository extends MongooseRepository<RequestEntity, RequestSchemaProps> {}
