import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { ReviewEntity } from "./entity";
import { ReviewSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Review entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `ReviewEntity` and `ReviewSchema`.
 */
@Service()
export abstract class ReviewRepository extends MongooseRepository<ReviewEntity, ReviewSchemaProps> {}
