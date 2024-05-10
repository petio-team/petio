import Attachment from './attatchment';

/**
 * Embed Author Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-author-structure
 */
export interface EmbedAuthor {
  /**
   * Name of the author.
   */
  name?: string;

  /**
   * URL of the author.
   */
  url?: string;

  /**
   * URL of the author icon.
   * (Only supports HTTP(s) and attachments)
   */
  icon_url?: string | Attachment;

  /**
   * Proxied URL of the author icon.
   */
  proxy_icon_url?: string;
}

/**
 * Embed Field Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-field-structure
 */
export interface EmbedField {
  /**
   * Name of the field.
   * Up to 256 characters.
   */
  name: string;

  /**
   * Value of the field.
   * Up to 1024 characters.
   */
  value: string;

  /**
   * Whether or not this field should be displayed inline.
   */
  inline?: boolean;
}

/**
 * Embed Footer Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
export interface EmbedFooter {
  /**
   * Footer text.
   */
  text: string;

  /**
   * URL of the footer icon.
   * Only supports HTTP(s) and attachments
   */
  icon_url?: string | Attachment;

  /**
   * A proxied URL of the footer icon.
   */
  proxy_icon_url?: string;
}

/**
 * Embed Image Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-image-structure
 */
export interface EmbedImage {
  /**
   * Source URL of the image.
   * (Only supports http(s) and attachments)
   */
  url: string | Attachment;

  /**
   * A proxied URL of the thumbnail.
   */
  proxy_url?: string;

  /**
   * Height of the thumbnail.
   */
  height?: number;

  /**
   * Width of the thumbnail.
   */
  width?: number;
}

/**
 * Embed Provider Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-provider-structure
 */
export interface EmbedProvider {
  /**
   * Name of the provider.
   */
  name?: string;

  /**
   * URL of the provider.
   */
  url?: string;
}

/**
 * Embed Thumbnail Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
 */
export interface EmbedThumbnail {
  /**
   * Source URL of the thumbnail.
   * (Only supports http(s) and attachments)
   */
  url: string | Attachment;

  /**
   * A proxied URL of the thumbnail.
   */
  proxy_url?: string;

  /**
   * Height of the thumbnail.
   */
  height?: number;

  /**
   * Width of the thumbnail.
   */
  width?: number;
}

/**
 * Embed Video Structure
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object-embed-video-structure
 */
export interface EmbedVideo {
  /**
   * Source URL of the video.
   */
  url: string;

  /**
   * Height of the video.
   */
  height?: number;

  /**
   * Width of the video.
   */
  width?: number;
}

/**
 * Embed object.
 *
 * @link https://discordapp.com/developers/docs/resources/channel#embed-object
 */
export default interface Embed {
  /**
   * Title of the embed.
   * Up to 256 characters.
   */
  title?: string;

  /**
   * Embed type.
   * (Always "rich" for webhook embeds)
   */
  type?: 'rich';

  /**
   * URL of embed.
   */
  url?: string;

  /**
   * Description of the embed.
   * Up to 2048 characters.
   */
  description?: string;

  /**
   * ISO8601 timestamp of the embed content.
   */
  timestamp?: string;

  /**
   * color code of the embed.
   */
  color?: number;

  /**
   * Footer information.
   */
  footer?: EmbedFooter;

  /**
   * Image information.
   */
  image?: EmbedImage;

  /**
   * Thumbnail information.
   */
  thumbnail?: EmbedThumbnail;

  /**
   * Video information.
   */
  video?: EmbedVideo;

  /**
   * Provider information.
   */
  provider?: EmbedProvider;

  /**
   * Author information.
   */
  author?: EmbedAuthor;

  /**
   * Fields information.
   * Up to 25 fields.
   */
  fields?: EmbedField[];
}
