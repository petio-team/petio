import { MongooseRepository } from "@/infrastructure/database/repository";
import { Service } from "diod";
import { UserEntity } from "./entity";
import { UserSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the User entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `UserEntity` and `UserSchema`.
 */
@Service()
export abstract class UserRepository extends MongooseRepository<UserEntity, UserSchemaProps> {
  abstract findOrCreate(user: UserEntity): Promise<UserEntity>;
}
