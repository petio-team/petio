import mongoose from 'mongoose';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateUserProps, UserProps, UserRole } from './types';

/**
 * Represents a User entity.
 */
export class UserEntity extends BaseEntity<UserProps> {
  /**
   * Creates a new User entity.
   * @param create - The properties to create the User entity.
   * @returns The newly created User entity.
   */
  static create(create: CreateUserProps): UserEntity {
    const id = new mongoose.Types.ObjectId().toString();
    const props: UserProps = {
      ...create,
      role: create.role || UserRole.USER,
      owner: create.owner || false,
      custom: create.custom || false,
      disabled: create.disabled || false,
      quotaCount: create.quotaCount || 0,
    };
    return new UserEntity({ id, props });
  }

  /**
   * Gets the title of the user.
   * @returns The title of the user.
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Gets the username of the user.
   * @returns The username of the user.
   */
  get username(): string {
    return this.props.username;
  }

  /**
   * Gets the password of the user.
   * @returns The password of the user.
   */
  get password(): string | undefined {
    return this.props.password;
  }

  /**
   * Gets the email of the user.
   * @returns The email of the user.
   */
  get email(): string {
    return this.props.email;
  }

  /**
   * Gets the thumbnail of the user.
   * @returns The thumbnail of the user.
   */
  get thumbnail(): string | undefined {
    return this.props.thumbnail;
  }

  /**
   * Gets whether the user has a custom thumbnail.
   * @returns Whether the user has a custom thumbnail.
   */
  get customThumbnail(): boolean | undefined {
    return this.props.customThumbnail;
  }

  /**
   * Gets the altId of the user.
   * @returns The altId of the user.
   */
  get altId(): string | undefined {
    return this.props.altId;
  }

  /**
   * Gets the plexId of the user.
   * @returns The plexId of the user.
   */
  get plexId(): string | undefined {
    return this.props.plexId;
  }

  /**
   * Gets the lastIp of the user.
   * @returns The lastIp of the user.
   */
  get lastIp(): string | undefined {
    return this.props.lastIp;
  }

  /**
   * Gets the role of the user.
   * @returns The role of the user.
   */
  get role(): UserRole {
    return this.props.role;
  }

  /**
   * Gets whether the user is an owner.
   * @returns Whether the user is an owner.
   */
  get owner(): boolean {
    return this.props.owner;
  }

  /**
   * Gets whether the user is custom.
   * @returns Whether the user is custom.
   */
  get custom(): boolean {
    return this.props.custom;
  }

  /**
   * Gets whether the user is disabled.
   * @returns Whether the user is disabled.
   */
  get disabled(): boolean {
    return this.props.disabled;
  }

  /**
   * Gets the quota count of the user.
   * @returns The quota count of the user.
   */
  get quotaCount(): number {
    return this.props.quotaCount;
  }

  /**
   * Gets the last login of the user.
   * @returns The last login of the user.
   */
  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  /**
   * Gets the profileId of the user.
   * @returns The profileId of the user.
   */
  get profileId(): string | undefined {
    return this.props.profileId;
  }

  /**
   * Validates the User entity.
   */
  public validate(): void {}
}
