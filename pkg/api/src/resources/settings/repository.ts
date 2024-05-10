import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { SettingsEntity } from "./entity";
import { SettingsSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Settings entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `SettingsEntity` and `SettingsSchema`.
 */
@Service()
export abstract class SettingsRepository extends MongooseRepository<SettingsEntity, SettingsSchemaProps> {
  abstract findOrCreate(settings: SettingsEntity): Promise<SettingsEntity>;
}
