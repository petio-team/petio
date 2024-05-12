import { MongooseRepository } from "@/infrastructure/database/repository";
import { Service } from "diod";
import { ImdbEntity } from "./entity";
import { ImdbSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Imdb entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `ImdbEntity` and `ImdbSchema`.
 */
@Service()
export abstract class ImdbRepository extends MongooseRepository<ImdbEntity, ImdbSchemaProps> {}
