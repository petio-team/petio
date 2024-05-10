import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { ArchiveEntity } from "./entity";
import { ArchiveSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Archive entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `ArchiveEntity` and `ArchiveSchema`.
 */
@Service()
export abstract class ArchiveRepository extends MongooseRepository<ArchiveEntity, ArchiveSchemaProps> {}
