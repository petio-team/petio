export default interface Attachment {
  /**
   * Attachment ID.
   */
  id: string;

  /**
   * Name of the file attached.
   */
  filename: string;

  /**
   * Size of the file in bytes.
   */
  size: number;

  /**
   * Source URL of the file.
   */
  url: string;

  /**
   * A proxied URL of the file.
   */
  proxy_url: string;

  /**
   * Height of the file. (if image)
   */
  height?: number;

  /**
   * Width of the file. (if image)
   */
  width: number;
}
