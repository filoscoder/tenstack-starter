import axios from "axios";
import CONFIG from "@/config";
import { logtailLogger } from "@/helpers/loggers";

export class Telegram {
  private static readonly TOKEN = CONFIG.EXTERNAL.TELEGRAM_BOT_KEY;
  private static readonly CHAT_ID = CONFIG.EXTERNAL.TELEGRAM_CHAT_ID;

  private static get url() {
    return `https://api.telegram.org/bot${this.TOKEN}/sendMessage`;
  }

  static async arturito(message: string) {
    try {
      await axios.post(this.url, {
        chat_id: this.CHAT_ID,
        text: message,
      });
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      if (CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.PRODUCTION)
        logtailLogger.warn(e);
    }
  }
}
