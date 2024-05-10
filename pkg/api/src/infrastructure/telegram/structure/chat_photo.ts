/**
 * @link https://core.telegram.org/bots/api#chatphoto
 */
export default interface ChatPhoto {
  /**
   * File identifier of small (160x160) chat photo. This file_id can be used only for photo download and only for as long as the photo is not changed.
   */
  small_file_id: string;

  /**
   * Unique file identifier of small (160x160) chat photo, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
   */
  small_file_unique_id: string;

  /**
   * File identifier of big (640x640) chat photo. This file_id can be used only for photo download and only for as long as the photo is not changed.
   */
  big_file_id: string;

  /**
   * Unique file identifier of big (640x640) chat photo, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
   */
  big_file_unique_id: string;
}
