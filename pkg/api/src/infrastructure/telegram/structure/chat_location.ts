import Location from "./location";

/**
 * @link https://core.telegram.org/bots/api#chatlocation
 */
export default interface ChatLocation {
  /**
   * The location to which the supergroup is connected. Can't be a live location.
   */
  location: Location;

  /**
   * Location address; 1-64 characters, as defined by the chat owner
   */
  address: string;
}
