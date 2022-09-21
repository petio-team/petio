import LoginURL from "./login_url";
import WebAppInfo from "./web_app_info";

/**
 * @link https://core.telegram.org/bots/api#inlinekeyboardbutton
 */
export default interface InlineKeyboardButton {
  /**
   * Label text on the button
   */
  text: string;

  /**
   * Optional. HTTP or tg:// URL to be opened when the button is pressed. Links tg://user?id=<user_id> can be used to mention a user by their ID without using a username, if this is allowed by their privacy settings.
   */
  url?: string;

  /**
   * Optional. Data to be sent in a callback query to the bot when button is pressed, 1-64 bytes
   * @link https://core.telegram.org/bots/api#callbackquery
   */
  callback_data: string;

  /**
   * Optional. Description of the Web App that will be launched when the user presses the button. The Web App will be able to send an arbitrary message on behalf of the user using the method answerWebAppQuery. Available only in private chats between a user and the bot.
   * @link https://core.telegram.org/bots/webapps
   * @link https://core.telegram.org/bots/api#answerwebappquery
   */
  web_app?: WebAppInfo;

  /**
   * Optional. An HTTPS URL used to automatically authorize the user. Can be used as a replacement for the Telegram Login Widget.
   * @link https://core.telegram.org/widgets/login
   */
  login_url?: LoginURL;

  /**
   * Optional. If set, pressing the button will prompt the user to select one of their chats, open that chat and insert the bot's username and the specified inline query in the input field. May be empty, in which case just the bot's username will be inserted.
   * Note: This offers an easy way for users to start using your bot in inline mode when they are currently in a privae chat with it. Especially useful when combined with switch_pm… actions - in this case the user will be automatically returned to the chat they switched from, skipping the chat selection screen.
   * @link https://core.telegram.org/bots/inline
   * @link https://core.telegram.org/bots/api#answerinlinequery
   */
  switch_inline_query?: string;

  /**
   * 	Optional. If set, pressing the button will insert the bot's username and the specified inline query in the current chat's input field. May be empty, in which case only the bot's username will be inserted.
   *  This offers a quick way for the user to open your bot in inline mode in the same chat - good for selecting something from multiple options.
   */
  switch_inline_query_current_chat?: string;

  /**
   * Optional. Description of the game that will be launched when the user presses the button.
   * NOTE: This type of button must always be the first button in the first row.
   * @link https://core.telegram.org/bots/api#callbackgame
   */
  callback_game?: unknown;

  /**
   * Optional. Specify True, to send a Pay button.
   * NOTE: This type of button must always be the first button in the first row and can only be used in invoice messages.
   * @link https://core.telegram.org/bots/api#payments
   */
  pay?: boolean;
}
