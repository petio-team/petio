import { Option } from "oxide.ts";
import { AnyObject, Document } from "mongoose";
import { CreateManyOptions, CreateOptions, ExistOptions, FindAllOptions, FindOneOptions, ManyOptions, RawOptions, RestoreManyOptions, SaveOptions, SoftDeleteManyOptions } from "./options";

/**
 * Abstract class representing a Mongoose repository.
 * @template Entity - The entity type.
 * @template Model - The Mongoose model type.
 */
export abstract class MongooseRepository<Entity, Model> {
  abstract findAll(
    find?: Record<string, any>,
    options?: FindAllOptions<any>
  ): Promise<Entity[]>;

  abstract findAllDistinct(
    fieldDistinct: string,
    find?: Record<string, any>,
    options?: FindAllOptions<any>,
  ): Promise<Entity[]>;

  abstract findOne(
    find: Record<string, any>,
    options?: FindOneOptions<any>,
  ): Promise<Option<Entity>>;

  abstract findOneById(
    id: string,
    options?: FindOneOptions<any>,
  ): Promise<Option<Entity>>;

  abstract exists(
    find: Record<string, any>,
    options?: ExistOptions<any>,
  ): Promise<boolean>;

  abstract create(
    data: Entity,
    options?: CreateOptions<any>
  ): Promise<Entity>;

  abstract save(
    repository: Model & Document<string>,
    options?: SaveOptions
  ): Promise<Entity>;

  abstract delete(
    repository: Model,
    options?: SaveOptions,
  ): Promise<Entity>;

  abstract softDelete(
    repository: Model & Document<string> & { deletedAt?: Date },
    options?: SaveOptions,
  ): Promise<Entity>;

  abstract restore(
    repository: Model & Document<string> & { deletedAt?: Date },
    options?: SaveOptions,
  ): Promise<Entity>;

  abstract createMany(
    data: Entity[],
    options?: CreateManyOptions<any>,
  ): Promise<boolean>;

  abstract deleteManyByIds(
    id: string[],
    options?: ManyOptions<any>
  ): Promise<boolean>;

  abstract deleteMany(
    find: Record<string, any>,
    options?: ManyOptions<any>,
  ): Promise<boolean>;

  abstract softDeleteManyByIds(
    id: string[],
    options?: SoftDeleteManyOptions<any>,
  ): Promise<boolean>;

  abstract softDeleteMany(
    find: Record<string, any>,
    options?: SoftDeleteManyOptions<any>,
  ): Promise<boolean>;

  abstract restoreManyByIds(
    id: string[],
    options?: RestoreManyOptions<any>,
  ): Promise<boolean>;

  abstract restoreMany(
    find: Record<string, any>,
    options?: RestoreManyOptions<any>,
  ): Promise<boolean>;

  abstract updateMany<T extends AnyObject>(
    find: Record<string, any>,
    data: T,
    options?: ManyOptions<any>,
  ): Promise<boolean>;

  abstract raw<RawResponse, RawQuery = any>(
    rawOperation: RawQuery,
    options?: RawOptions,
  ): Promise<RawResponse[]>;

  abstract model(): Promise<any>;
}
