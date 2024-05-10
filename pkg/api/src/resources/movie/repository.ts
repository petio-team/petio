import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { MovieEntity } from "./entity";
import { MovieSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Movie entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `MovieEntity` and `MovieSchema`.
 */
@Service()
export abstract class MovieRepository extends MongooseRepository<MovieEntity, MovieSchemaProps> {}
