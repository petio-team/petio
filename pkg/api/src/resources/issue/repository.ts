import { MongooseRepository } from "@/infra/database/repository";
import { Service } from "diod";
import { IssueEntity } from "./entity";
import { IssueSchemaProps } from "./schema";

/**
 * Represents a repository for interacting with the Issue entities.
 * This class extends the `MongooseBaseRepository` class and provides specific functionality for the `IssueEntity` and `IssueSchema`.
 */
@Service()
export abstract class IssueRepository extends MongooseRepository<IssueEntity, IssueSchemaProps> {}
