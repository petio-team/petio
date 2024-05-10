import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infra/entity/entity';

import { CreateProfileProps, ProfileProps } from './types';

/**
 * Represents a Profile entity.
 */
export class ProfileEntity extends BaseEntity<ProfileProps> {
  /**
   * Creates a new Profile entity.
   * @param create - The properties to create the Profile entity.
   * @returns The newly created Profile entity.
   */
  static create(create: CreateProfileProps): ProfileEntity {
    const id = nanoid();
    const props: ProfileProps = {
      ...create,
    };
    return new ProfileEntity({ id, props });
  }

  /**
   * Gets the name of the profile.
   * @returns The name of the profile.
   */
  get name(): string {
    return this.props.name;
  }

  /**
   * Gets the radarr of the profile.
   * @returns The radarr of the profile.
   */
  get radarr(): Record<string, unknown> {
    return this.props.radarr;
  }

  /**
   * Gets the sonarr of the profile.
   * @returns The sonarr of the profile.
   */
  get sonarr(): Record<string, unknown> {
    return this.props.sonarr;
  }

  /**
   * Gets the autoApprove of the profile.
   * @returns The autoApprove of the profile.
   */
  get autoApprove(): boolean {
    return this.props.autoApprove;
  }

  /**
   * Gets the autoApproveTv of the profile.
   * @returns The autoApproveTv of the profile.
   */
  get autoApproveTv(): boolean {
    return this.props.autoApproveTv;
  }

  /**
   * Gets the quota of the profile.
   * @returns The quota of the profile.
   */
  get quota(): number {
    return this.props.quota;
  }

  /**
   * Gets the isDefault of the profile.
   * @returns The isDefault of the profile.
   */
  get isDefault(): boolean {
    return this.props.isDefault;
  }

  /**
   * Validates the Profile entity.
   */
  public validate(): void {}
}
