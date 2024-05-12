import { StringValidation } from "zod";

/**
 * @link https://core.telegram.org/bots/api#photosize
 */
export default interface PhotoSize {
  /**
   * 	Identifier for this file, which can be used to download or reuse the file
   */
  file_id: string;

  /**
   * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
   */
  file_unique_id: string;

  /**
   * Photo width
   */
  width: number;

  /**
   * Photo height
   */
  height: number;

  /**
   * Optional. File size in bytes
   */
  file_size: number;
}
