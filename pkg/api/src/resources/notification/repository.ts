import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { NotificationEntity } from "./entity";
import { NotificationSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Notification entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `NotificationEntity` and `NotificationSchema`.
 */
@Service()
export abstract class NotificationRepository extends MongooseRepository<NotificationEntity, NotificationSchemaProps> {}
