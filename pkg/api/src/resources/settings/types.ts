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
  initialCache: boolean;
  initialSetup: boolean;
};

/**
 * Represents the properties for creating a Settings.
 */
export type CreateSettingsProps = SettingsProps & {
  // TODO: add additional fields
};
