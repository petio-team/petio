import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { DiscoveryEntity } from "./entity";
import { DiscoverySchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Discovery entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `DiscoveryEntity` and `DiscoverySchema`.
 */
@Service()
export abstract class DiscoveryRepository extends MongooseRepository<DiscoveryEntity, DiscoverySchemaProps> {}
