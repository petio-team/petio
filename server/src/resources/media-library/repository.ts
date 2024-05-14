import { MongooseRepository } from "@/infrastructure/database/repository";
import { Service } from "diod";
import { MediaLibraryEntity } from "./entity";
import { MediaLibrarySchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the MediaLibrary entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `MediaLibraryEntity` and `MediaLibrarySchema`.
 */
@Service()
export abstract class MediaLibraryRepository extends MongooseRepository<MediaLibraryEntity, MediaLibrarySchemaProps> {}