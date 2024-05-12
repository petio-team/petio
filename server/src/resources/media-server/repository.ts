import { MongooseRepository } from "@/infrastructure/database/repository";
import { Service } from "diod";
import { MediaServerEntity } from "./entity";
import { MediaServerSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the media server entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `MediaServerEntity` and `MediaServerSchema`.
 */
@Service()
export abstract class MediaServerRepository extends MongooseRepository<MediaServerEntity, MediaServerSchemaProps> {
  abstract findOneOrCreate(entity: MediaServerEntity): Promise<MediaServerEntity>;
}
