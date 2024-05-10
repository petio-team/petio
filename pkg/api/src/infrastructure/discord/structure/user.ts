export default interface User {
  /**
   * User ID
   * Snowflake
   */
  id: string;

  /**
   * User's username.
   * Not unique across the platform.
   */
  username: string;

  /**
   * The user's 4-digit discord-tag
   */
  discriminator: string;

  /**
   * User's avatar hash.
   */
  avatar: string;

  /**
   * Whether or not the user belongs to an OAuth2 application.
   */
  bot?: boolean;

  /**
   * Whether or not the user has two-factor authentication enabled.
   */
  mfa_enabled?: boolean;

  /**
   * The user's chosen language option.
   */
  locale?: string;

  /**
   * Whether or not the user has verified their email address.
   */
  verified?: string;

  /**
   * The user's email address.
   */
  email?: string;

  /**
   * The flags on the user's account.
   *
   * @link https://discordapp.com/developers/docs/resources/user#user-object-user-flags
   */
  flags?: number;

  /**
   * User's Nitro subscription type.
   */
  premium_type: number;
}
