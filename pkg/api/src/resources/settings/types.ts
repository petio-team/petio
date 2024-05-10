import { Override } from '../../infra/utils/override';

/**
 * Represents the authentication types.
 */
export enum AuthType {
  STANDARD = 1,
  FAST = 2,
}

/**
 * Represents the properties of a Settings.
 */
export type SettingsProps = {
  popularContent: boolean;
  authType: AuthType;
  appKeys: string[];
  initialCache: boolean;
  initialSetup: boolean;
};

/**
 * Represents the properties for creating a Settings.
 */
export type CreateSettingsProps = Override<
  SettingsProps,
  {
    popularContent?: boolean;
    authType?: AuthType;
    appKeys?: string[];
    initialCache?: boolean;
    initialSetup?: boolean;
  }
>;
