/* eslint-disable no-underscore-dangle */
import { ArgumentInvalidException, ArgumentNotProvidedException } from "../exceptions/exceptions";
import { isEmpty } from "./guard";

/**
 * Represents a unique identifier.
 */
export type Identifier = string;

/**
 * Represents the properties of a base entity.
 */
export interface BaseEntityProps {
  id: Identifier,
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Represents the properties for creating an entity.
 * @template T - The type of the entity properties.
 */
export interface CreateEntityProps<T> {
  id: Identifier,
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents the base entity class.
 * @template EntityProps - The type of the entity properties.
 */
export abstract class BaseEntity<EntityProps> {
  /**
   * Represents the properties of an entity.
   */
  protected readonly props: EntityProps;

  /**
   * Represents the identifier of an entity.
   */
  private readonly _id!: Identifier;

  /**
   * Represents the creation date of the entity.
   */
  private readonly _createdAt: Date;

  /**
   * Represents the date and time when the entity was last updated.
   */
  private _updatedAt: Date;

  /**
   * Represents an entity.
   */
  constructor({
    id,
    createdAt,
    updatedAt,
    props,
  }: CreateEntityProps<EntityProps>) {
    this.validateProps(props);
    const now = new Date();
    this._id = id;
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;
    this.validate();
  }

  /**
   * Gets the identifier of the entity.
   * @returns The identifier of the entity.
   */
  get id(): Identifier {
    return this._id;
  }

  /**
   * Gets the creation date of the entity.
   * @returns The creation date.
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Gets the date and time when the entity was last updated.
   * @returns The date and time when the entity was last updated.
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Checks if the given entity is an instance of BaseEntity.
   * @param entity - The entity to check.
   * @returns True if the entity is an instance of BaseEntity, false otherwise.
   */
  static isEntity(entity: unknown): entity is BaseEntity<unknown> {
    return entity instanceof BaseEntity;
  }


  /**
   * Checks if the current entity is equal to the given object.
   *
   * @param object - The object to compare with.
   * @returns `true` if the entities are equal, `false` otherwise.
   */
  public equals(object?: BaseEntity<EntityProps>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!BaseEntity.isEntity(object)) {
      return false;
    }

    return this.id ? this.id === object.id : false;
  }

  /**
   * Gets the properties of an entity.
   * @returns The properties of the entity.
   */
  public getProps(): EntityProps & BaseEntityProps {
    const propsCopy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(propsCopy);
  }

  /**
   * Converts the entity to an object.
   * @returns An object representing the entity.
   */
  public toObject(): Object {
    const result = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(result);
  }

  /**
   * Validates the properties of an entity.
   */
  public abstract validate(): void;

  /**
   * Validates the properties of an entity.
   * @param props - The properties to validate.
   */
  private validateProps(props: EntityProps): void {
    if (isEmpty(props)) {
      throw new ArgumentNotProvidedException('Entity props cannot be empty');
    }
    if (typeof props !== 'object') {
      throw new ArgumentInvalidException('Entity props must be an object');
    }
  }
}
