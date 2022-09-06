import Axios, { AxiosInstance } from "axios";
import path from "path";
import { PARAMS } from "./requests/request";

export default class TelegramAPI {
  /**
   * Telegram API
   */
  protected client: AxiosInstance;

  /**
   * Telegram API URL
   */
  private url: string = "https://api.telegram.org";

  /**
   * Telegram API constructor
   */
  public constructor(token: string) {
    const url = path.join(this.url, `/bot${token}/sendMessage`);
    this.client = Axios.create({
      baseURL: url,
    });
  }

  /**
   * Execute the current request.
   */
  public execute(options: PARAMS) {
    return this.client.request({
      method: 'POST',
      params: options,
    });
  }
}
