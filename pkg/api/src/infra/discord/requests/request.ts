import Attachment from '../structure/attatchment';
import Embed from '../structure/embed';

/**
 * Modify a webhook
 *
 * @link https://discordapp.com/developers/docs/resources/webhook#modify-webhook
 */
export interface PATCH {
  /**
   * Update the default name of the webhook.
   */
  name?: string;

  /**
   * Update the default avatar of the webhook.
   */
  avatar?: string;

  /**
   * Move the webhook to another channel.
   * Snowflake
   */
  channel_id?: string;
}

export interface Base {
  /**
   * Webhook username override.
   */
  username?: string;

  /**
   * Webhook avatar override.
   */
  avatar_url?: string;

  /**
   * Whether or not this notification should be read as text to speech.
   */
  tts?: boolean;
}

export interface Content {
  /**
   * Message contents.
   * Max 2000 characters
   */
  content: string;
}

export interface File {
  /**
   * Contents of a file being sent.
   */
  file: Attachment | string;
}

export interface Embeds {
  /**
   * Embedded "rich" content.
   */
  embeds: Embed[];
}

/**
 * Discord webhook execution content.
 *
 * @link https://discordapp.com/developers/docs/resources/webhook#execute-webhook
 */
export type POST = (Base & Content) | File | Embeds;
