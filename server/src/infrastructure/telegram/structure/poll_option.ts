/**
 * @link https://core.telegram.org/bots/api#polloption
 */
export default interface PollOption {
  /**
   * Option text, 1-100 characters
   */
  text: string;

  /**
   * Number of users that voted for this option
   */
  voter_count: number;
}
