import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { ProfileEntity } from "./entity";
import { ProfileSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Profile entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `ProfileEntity` and `ProfileSchema`.
 */
@Service()
export abstract class ProfileRepository extends MongooseRepository<ProfileEntity, ProfileSchemaProps> {}
