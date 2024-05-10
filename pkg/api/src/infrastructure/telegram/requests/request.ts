import MessageEntity from "../structure/message_entity";

export interface PARAMS {
  /**
   * Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  chat_id: string | number;

  /**
   * Text of the message to be sent, 1-4096 characters after entities parsing
   */
  text: string;

  /**
   * Mode for parsing entities in the message text. See formatting options for more details.
   * @link https://core.telegram.org/bots/api#formatting-options
   */
  parse_mode?: string;

  /**
   * A JSON-serialized list of special entities that appear in message text, which can be specified instead of parse_mode
   * @link https://core.telegram.org/bots/api#messageentity
   */
  entities?: MessageEntity[];

  /**
   * Disables link previews for links in this message
   */
  disable_web_page_preview?: boolean;

  /**
   * Sends the message silently. Users will receive a notification with no sound.
   * @link https://telegram.org/blog/channels-2-0#silent-messages
   */
  disable_notification?: boolean;

  /**
   * Protects the contents of the sent message from forwarding and saving
   */
  protect_content?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Pass True, if the message should be sent even if the specified replied-to message is not found
   */
  allow_sending_without_reply?: boolean;

  /**
   * Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user.
   * @link https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating
   * @link https://core.telegram.org/bots#keyboards
   */
  reply_markup?: unknown;
}
