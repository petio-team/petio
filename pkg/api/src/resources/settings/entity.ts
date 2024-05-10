import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infra/entity/entity';

import { CreateSettingsProps, SettingsProps } from './types';

/**
 * Represents a Settings entity.
 */
export class SettingsEntity extends BaseEntity<SettingsProps> {
  /**
   * Creates a new Settings entity.
   * @param create - The properties to create the Settings entity.
   * @returns The newly created Settings entity.
   */
  static create(create: CreateSettingsProps): SettingsEntity {
    const id = nanoid();
    const props: SettingsProps = {
      ...create,
      popularContent: create.popularContent || false,
      authType: create.authType || 1,
      appKeys: create.appKeys || [],
      initialCache: create.initialCache || false,
      initialSetup: create.initialSetup || false,
    };
    return new SettingsEntity({ id, props });
  }

  /**
   * Gets the value of the popularContent property.
   *
   * @returns {boolean} The value of the popularContent property.
   */
  get popularContent(): boolean {
    return this.props.popularContent;
  }

  /**
   * Gets the authentication type.
   * @returns The authentication type as a number.
   */
  get authType(): number {
    return this.props.authType;
  }

  /**
   * Gets the initial cache value.
   * @returns The initial cache value.
   */
  get initialCache(): boolean {
    return this.props.initialCache;
  }

  /**
   * Gets the initial setup value.
   * @returns The initial setup value.
   */
  get initialSetup(): boolean {
    return this.props.initialSetup;
  }

  /**
   * Validates the Settings entity.
   */
  public validate(): void {}
}
