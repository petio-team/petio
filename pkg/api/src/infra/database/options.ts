import { PopulateOptions } from "mongoose";
import { Mapper } from "../entity/mapper";
import { PaginationOptions } from "./pagination";

/**
 * Represents the options for a relation.
 */
export type RelationOptions = PopulateOptions & {
  mapper: Mapper<any, any>,
};

/**
 * Options for the `findOne` method.
 */
export interface FindOneOptions<T = any> extends Pick<PaginationOptions, 'order'> {
  /**
   * Specifies the fields to be selected in the query result.
   */
  select?: Record<string, boolean | number>;

  /**
   * Specifies the relations to be loaded in the query result.
   */
  relations?: boolean | RelationOptions[];

  /**
   * Specifies the session to be used for the query.
   */
  session?: T;

  /**
   * Specifies whether to include soft-deleted records in the query result.
   */
  withDeleted?: boolean;
}

/**
 * Options for saving data in the database.
 *
 * @typeparam T - The type of data being saved.
 */
export type SaveOptions<T = any> = Pick<FindOneOptions<T>, 'session'>;

/**
 * Options for finding all entities in the database.
 *
 * @template T - The type of the entity.
 */
export interface FindAllOptions<T = any>
  extends PaginationOptions,
    Omit<FindOneOptions<T>, 'order'> {}

/**
 * Options for creating a new entity.
 *
 * @template T - The type of the entity.
 */
export interface CreateOptions<T = any>
  extends Pick<FindOneOptions<T>, 'session'> {
    id: string;
  }

/**
 * Options for checking the existence of an entity in the database.
 *
 * @template T - The type of the entity.
 */
export interface ExistOptions<T = any>
  extends Pick<FindOneOptions<T>, 'session' | 'withDeleted' | 'relations'> {
    excludeId?: string[];
  }

/**
 * Represents the options for performing many operations in the database.
 *
 * @template T - The type of the data being operated on.
 */
export type ManyOptions<T = any> = Pick<FindOneOptions<T>, 'session' | 'relations'>;

/**
 * Options for updating many entities in the database.
 *
 * @template T - The type of the entity.
 */
export type CreateManyOptions<T = any> = Pick<FindOneOptions<T>, 'session'>;

/**
 * Options for updating many entities in the database.
 *
 * @template T - The type of the entity.
 */
export type SoftDeleteManyOptions<T = any> = ManyOptions<T>;

/**
 * Options for restoring many entities in the database.
 *
 * @template T - The type of the entity.
 */
export type RestoreManyOptions<T = any> = ManyOptions<T>;

/**
 * Options for deleting many entities in the database.
 *
 * @template T - The type of the entity.
 */
export type RawOptions<T = any> = Pick<FindOneOptions<T>, 'session' | 'withDeleted'>;
