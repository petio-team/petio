import User from "./user";

/**
 * @link https://core.telegram.org/bots/api#messageentity
 */
export default interface MessageEntity {
  /**
   * Type of the entity. Currently, can be “mention” (@username), “hashtag” (#hashtag),
   * “cashtag” ($USD), “bot_command” (/start@jobs_bot), “url” (https://telegram.org),
   * “email” (do-not-reply@telegram.org), “phone_number” (+1-212-555-0123),
   * “bold” (bold text), “italic” (italic text), “underline” (underlined text),
   * “strikethrough” (strikethrough text), “spoiler” (spoiler message),
   * “code” (monowidth string), “pre” (monowidth block),
   * “text_link” (for clickable text URLs), “text_mention” (for users without usernames)
   */
  type: string;

  /**
   * Offset in UTF-16 code units to the start of the entity
   */
  offset: number;

  /**
   * 	Length of the entity in UTF-16 code units
   */
  length: number;

  /**
   * Optional. For “text_link” only, URL that will be opened after user taps on the text
   */
  url?: string;

  /**
   * 	Optional. For “text_mention” only, the mentioned user
   */
  user?: User;

  /**
   * 	Optional. For “pre” only, the programming language of the entity text
   */
  language?: string;
}
