import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { DownloaderEntity } from "./entity";
import { DownloaderSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Downloader entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `DownloaderEntity` and `DownloaderSchema`.
 */
@Service()
export abstract class DownloaderRepository extends MongooseRepository<DownloaderEntity, DownloaderSchemaProps> {
  abstract findOrCreate(downloader: DownloaderEntity): Promise<DownloaderEntity>;
}
