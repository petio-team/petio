import { ClientSession, Model , Document , AnyObject , PipelineStage } from "mongoose";
import { Option, Some, None } from 'oxide.ts';
import { Service } from "diod";
import { BaseEntity } from "../entity/entity";
import { MongooseRepository } from "./repository";
import { Mapper } from "../entity/mapper";
import { CreateOptions, ExistOptions, FindAllOptions, FindOneOptions, ManyOptions, RawOptions, RelationOptions, SaveOptions, SoftDeleteManyOptions } from "./options";
import { ArgumentInvalidException } from "../exceptions/exceptions";

/**
 * Base repository class for Mongoose-based repositories.
 *
 * @template Entity - The entity type managed by the repository.
 * @template EntityDocument - The Mongoose document type corresponding to the entity.
 */
@Service()
export abstract class MongooseBaseRepository<
  Entity extends BaseEntity<any>,
  EntityDocument
> extends MongooseRepository<Entity, EntityDocument> {
  /**
   * Represents the name of the repository.
   */
  readonly repositoryName: string;

  /**
   * Creates a new MongooseBaseRepository.
   *
   * @param repository - The Mongoose model used to interact with the database.
   * @param mapper - The mapper used to convert entities to and from documents.
   * @param relations - The relations to be populated when querying the database.
   */
  constructor(
    protected readonly repository: Model<EntityDocument>,
    protected readonly mapper: Mapper<Entity, EntityDocument>,
    protected readonly relations?: RelationOptions[],
  ) {
    super();
    this.repositoryName = repository.collection.collectionName;
  }

  /**
   * Retrieves all entities from the database based on the provided criteria and options.
   *
   * @param find - Optional criteria to filter the entities.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to an array of entities.
   */
  async findAll(
    find?: Record<string, any>,
    options?: FindAllOptions<ClientSession>,
  ): Promise<Entity[]> {
    const query = this.repository.find<EntityDocument>(find ?? {});
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (options?.withDeleted) {
      query.or([
        {
          deletedAt: { $exists: false }
        },
        {
          deletedAt: { $exists: true }
        }
      ]);
    } else {
      query.where('deletedAt').exists(false);
    }

    if (options?.select) {
      query.select(options.select);
    }

    if (options?.paging) {
      query
        .limit(options.paging.limit)
        .skip(options.paging.offset);
    }

    if (options?.order) {
      query.sort(options.order);
    }

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.lean().exec() as EntityDocument[];
    // * hacky way to convert relations to entities
    return results.map((r) => {
      if (relationOptions) {
        this.relationsToEntities(r, relationOptions);
      }
      return this.mapper.toEntity(r);
    });
  }

  /**
   * Finds all distinct values for a given field in the database.
   *
   * @param fieldDistinct - The field for which to find distinct values.
   * @param find - Optional. The query criteria to filter the results.
   * @param options - Optional. Additional options for the query.
   * @returns A promise that resolves to an array of entities.
   */
  async findAllDistinct(
    fieldDistinct: string,
    find?: Record<string, any>,
    options?: FindAllOptions<ClientSession>,
  ): Promise<Entity[]> {
    const query = this.repository.distinct<EntityDocument>(fieldDistinct, find ?? {});
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (options?.withDeleted) {
      query.or([
        {
          deletedAt: { $exists: false }
        },
        {
          deletedAt: { $exists: true }
        }
      ]);
    } else {
      query.where('deletedAt').exists(false);
    }

    if (options?.select) {
      query.select(options.select);
    }

    if (options?.paging) {
      query
        .limit(options.paging.limit)
        .skip(options.paging.offset);
    }

    if (options?.order) {
      query.sort(options.order);
    }

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.lean().exec();
    // * hacky way to convert relations to entities
    return results.map((r) => {
      if (relationOptions) {
        this.relationsToEntities(r, relationOptions);
      }
      return this.mapper.toEntity(r);
    });
  }

  /**
   * Finds a single entity in the database based on the provided criteria and options.
   *
   * @param find - The criteria to filter the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to an option of the entity.
   */
  async findOne(
    find: Record<string, any>,
    options?: FindOneOptions<ClientSession>
  ): Promise<Option<Entity>> {
    const query = this.repository.findOne<EntityDocument>(find ?? {});
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (options?.withDeleted) {
      query.or([
        {
          deletedAt: { $exists: false }
        },
        {
          deletedAt: { $exists: true }
        }
      ]);
    } else {
      query.where('deletedAt').exists(false);
    }

    if (options?.select) {
      query.select(options.select);
    }

    if (options?.order) {
      query.sort(options.order);
    }

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const result = await query.exec();
    if (result) {
      // * hacky way to convert relations to entities
      if (relationOptions) {
        this.relationsToEntities(result, relationOptions);
      }
      return Some(this.mapper.toEntity(result));
    }
    return None;
  }

  /**
   * Finds a single entity in the database based on the provided ID and options.
   *
   * @param id - The ID of the entity to find.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to an option of the entity.
   */
  async findOneById(
    id: string,
    options?: FindOneOptions<ClientSession>,
  ): Promise<Option<Entity>> {
    const query = this.repository.findById<EntityDocument>({ id });
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (options?.withDeleted) {
      query.or([
        {
          deletedAt: { $exists: false }
        },
        {
          deletedAt: { $exists: true }
        }
      ]);
    } else {
      query.where('deletedAt').exists(false);
    }

    if (options?.select) {
      query.select(options.select);
    }

    if (options?.order) {
      query.sort(options.order);
    }

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const result = await query.exec();
    if (result) {
      // * hacky way to convert relations to entities
      if (relationOptions) {
        this.relationsToEntities(result, relationOptions);
      }
      return Some(this.mapper.toEntity(result));
    }
    return None;
  }

  /**
   * Checks if an entity exists in the database based on the provided criteria and options.
   *
   * @param find - The criteria to filter the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entity exists, `false` otherwise.
   */
  async exists(
    find: Record<string, any>,
    options?: ExistOptions<ClientSession>
  ): Promise<boolean> {
    let findElm = find;
    if (options?.excludeId) {
      findElm = {
        ...find,
        id: {
          $nin: options.excludeId ?? [],
        }
      };
    }

    const query = this.repository.exists(findElm);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (options?.withDeleted) {
      query.or([
        {
          deletedAt: { $exists: false }
        },
        {
          deletedAt: { $exists: true }
        }
      ]);
    } else {
      query.where('deletedAt').exists(false);
    }

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const result = await query.exec();
    return !!result;
  }

  /**
   * Creates a new entity in the database based on the provided data and options.
   *
   * @param data - The entity data used to create the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to the created entity.
   */
  public async create(
    data: Entity,
    options?: CreateOptions<ClientSession>,
  ): Promise<Entity> {
    const record = this.mapper.toPeristence(data) as any;

    if (options?.id) {
      record.id = options.id;
    }

    const created = await this.repository.create([record], {
      session: options ? options.session : undefined
    });

    return this.mapper.toEntity(created[0]);
  }

  /**
   * Saves an entity in the database based on the provided repository and options.
   *
   * @param repository - The repository used to save the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to the saved entity.
   */
  async save(
    repository: EntityDocument & Document<string>,
    options?: SaveOptions,
  ): Promise<Entity> {
    const result = await repository.save(options);
    return this.mapper.toEntity(result);
  }

  /**
   * Deletes an entity from the database based on the provided repository and options.
   *
   * @param repository - The repository used to delete the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to the deleted entity.
   */
  async delete(
    repository: EntityDocument & Document<string>,
    options?: SaveOptions,
  ): Promise<Entity> {
    const result = await repository.deleteOne(options);
    return this.mapper.toEntity(result);
  }

  /**
   * Soft-deletes an entity from the database based on the provided repository and options.
   *
   * @param repository - The repository used to soft-delete the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to the soft-deleted entity.
   */
  async softDelete(
    repository: EntityDocument & Document<string> & { deletedAt?: Date; },
    options?: SaveOptions,
  ): Promise<Entity> {
    const result = await repository.save(options);
    return this.mapper.toEntity(result);
  }

  /**
   * Restores a soft-deleted entity in the database based on the provided repository and options.
   *
   * @param repository - The repository used to restore the entity.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to the restored entity.
   */
  async restore(
    repository: EntityDocument & Document<string> & { deletedAt?: Date; },
    options?: SaveOptions,
  ): Promise<Entity> {
    const result = await repository.save(options);
    return this.mapper.toEntity(result);
  }

  /**
   * Creates multiple entities in the database based on the provided data and options.
   *
   * @param data - The entity data used to create the entities.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were created successfully.
   */
  async createMany(
    data: Entity[],
    options?: ManyOptions<ClientSession>,
  ): Promise<boolean> {
    const records = data.map((r) => this.mapper.toPeristence(r));
    await this.repository.insertMany(records, {
      session: options ? options.session : undefined
    });
    return true;
  }

  /**
   * Deletes multiple entities from the database based on the provided IDs and options.
   *
   * @param id - The IDs of the entities to delete.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were deleted successfully.
   */
  async deleteManyByIds(
    id: string[],
    options?: ManyOptions<ClientSession>,
  ): Promise<boolean> {
    const query = this.repository.deleteMany({
      id: {
        $in: id,
      }
    });
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return !!results.deletedCount;
  }

  /**
   * Deletes multiple entities from the database based on the provided criteria and options.
   *
   * @param find - The criteria to filter the entities.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were deleted successfully.
   */
  async deleteMany(
    find: Record<string, any>,
    options?: ManyOptions<ClientSession>,
  ): Promise<boolean> {
    const query = this.repository.deleteMany(find);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return !!results.deletedCount;
  }

  /**
   * Soft-deletes multiple entities from the database based on the provided IDs and options.
   *
   * @param id - The IDs of the entities to soft-delete.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were soft-deleted successfully.
   */
  async softDeleteManyByIds(
    id: string[],
    options?: ManyOptions<ClientSession>,
  ): Promise<boolean> {
    const query = this.repository.updateMany(
      {
        id: {
          $in: id,
        }
      },
      {
        $set: {
          deletedAt: new Date(),
        }
      }
    )
      .where('deletedAt')
      .exists(false);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return results.acknowledged;
  }

  /**
   * Soft-deletes multiple entities from the database based on the provided criteria and options.
   *
   * @param find - The criteria to filter the entities.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were soft-deleted successfully.
   */
  async softDeleteMany(
    find: Record<string, any>,
    options?: SoftDeleteManyOptions<ClientSession>,
  ): Promise<boolean> {
    const query = this.repository.updateMany(find, {
      $set: {
        deletedAt: new Date(),
      }
    })
      .where('deletedAt')
      .exists(false);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return results.acknowledged;
  }

  /**
   * Restores multiple entities from the database based on the provided IDs and options.
   *
   * @param id - The IDs of the entities to restore.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were restored successfully.
   */
  async restoreManyByIds(
    id: string[],
    options?: ManyOptions<ClientSession>,
  ): Promise<boolean> {
    const query = this.repository
      .updateMany(
        {
          id: {
            $in: id,
          }
        },
        {
          $set: {
            deletedAt: undefined,
          }
        }
      )
      .where('deletedAt')
      .exists(true);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return results.acknowledged;
  }

  /**
   * Restores multiple entities from the database based on the provided criteria and options.
   *
   * @param find - The criteria to filter the entities.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were restored successfully.
   */
  async restoreMany(
    find: Record<string, any>,
    options?: ManyOptions<ClientSession>,
  ): Promise<boolean> {
    const query = this.repository
      .updateMany(find, {
        $set: {
          deletedAt: undefined,
        }
      })
      .where('deletedAt')
      .exists(true);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return results.acknowledged;
  }

  /**
   * Updates multiple entities in the database based on the provided criteria and options.
   *
   * @param find - The criteria to filter the entities.
   * @param data - The data used to update the entities.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to `true` if the entities were updated successfully.
   */
  async updateMany<T extends AnyObject>(
    find: Record<string, any>,
    data: T,
    options?: ManyOptions<ClientSession>
  ): Promise<boolean> {
    const query = this.repository
      .updateMany(find, {
        $set: data,
      })
      .where('deletedAt')
      .exists(false);
    const relationOptions: RelationOptions[] | undefined =
      typeof options?.relations === 'boolean'
        ? this.relations
        : options?.relations;

    if (relationOptions) {
      query.populate(relationOptions);
    }

    if (options?.session) {
      query.session(options.session);
    }

    const results = await query.exec();
    return results.acknowledged;
  }

  /**
   * Performs a raw operation on the database based on the provided query and options.
   *
   * @template RawResponse - The type of the raw response.
   * @template RawQuery - The type of the raw query.
   * @param rawOperation - The raw query to execute.
   * @param options - Optional options to customize the query.
   * @returns A promise that resolves to the raw response.
   */
  async raw<RawResponse, RawQuery = PipelineStage[]>(
    rawOperation: RawQuery,
    options?: RawOptions,
  ): Promise<RawResponse[]> {
    if (!Array.isArray(rawOperation)) {
      throw new ArgumentInvalidException('Argument must be an array');
    }

    const pipeline: PipelineStage[] = rawOperation;
    if (options?.withDeleted) {
      pipeline.push({
        $match: {
          $or: [
            {
              "deletedAt": {
                $exists: false,
              }
            },
            {
              "deletedAt": {
                $exists: true,
              }
            }
          ]
        }
      });
    } else {
      pipeline.push({
        $match: {
          "deletedAt": {
            $exists: false,
          }
        }
      });
    }

    const aggregate = this.repository.aggregate<RawResponse>(pipeline);

    if (options?.session) {
      aggregate.session(options.session);
    }

    return aggregate;
  }

  /**
   * Converts relations to entities.
   *
   * @param results - The results to convert.
   * @param relations - The relations to convert.
   * @returns The converted results.
   */
  private relationsToEntities(results: EntityDocument, relations: RelationOptions[]): any {
    const obj = <any>results;
    relations.forEach((o) => {
      if (o.localField && o.localField in obj) {
        if (o.justOne && typeof obj[o.localField] === 'object') {
          obj[o.localField] = o.mapper.toEntity(obj[o.localField]);
        } else if (!o.justOne && Array.isArray(obj[o.localField])) {
          obj[o.localField] = obj[o.localField].map((i: { localField: string | number; }) => o.mapper.toEntity(i));
        }
      }
    });
    return obj;
  }

  /**
   * Gets the model for the repository.
   *
   * @returns A promise that resolves to the model for the repository.
   */
  async model(): Promise<Model<EntityDocument>> {
    return this.repository;
  }
}
