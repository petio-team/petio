import User from '../structure/user';

/**
 * GET a webhook.
 *
 * @link https://discordapp.com/developers/docs/resources/webhook#get-webhook
 */
export interface GET {
  /**
   * ID of the current webhook.
   * Snowflake
   */
  id: string;

  /**
   * ID of the channel this webhook belongs to.
   * Snowflake
   */
  channel_id: string;

  /**
   * ID of the guild this webhook belongs to.
   * Snowflake
   */
  guild_id: string;

  /**
   * User that created this webhook.
   */
  user?: User;

  /**
   * Name of the current webhook.
   */
  name: string;

  /**
   * Avatar of the current webhook.
   */
  avatar: string;

  /**
   * Secure token of the current webhook.
   */
  token: string;
}
