import InlineKeyboardButton from "./inline_keyboard_button";

/**
 * @link https://core.telegram.org/bots/api#inlinekeyboardmarkup
 */
export default interface InlineKeyboardMarkup {
  /**
   * Array of button rows, each represented by an Array of InlineKeyboardButton objects
   * @link https://core.telegram.org/bots/api#inlinekeyboardbutton
   */
  inline_keyboard: InlineKeyboardButton[];
}
