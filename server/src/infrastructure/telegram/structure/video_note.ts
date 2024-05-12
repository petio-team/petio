import PhotoSize from "./photo_size";

/**
 * @link https://core.telegram.org/bots/api#videonote
 */
export default interface VideoNote {
  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  file_id: string;

  /**
   * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
   */
  file_unique_id: string;

  /**
   * Video width and height (diameter of the video message) as defined by sender
   */
  length: number;

  /**
   * Duration of the video in seconds as defined by sender
   */
  duration: number;

  /**
   * Optional. Video thumbnail
   */
  thumb?: PhotoSize;

  /**
   * Optional. File size in bytes
   */
  file_size?: number;
}
