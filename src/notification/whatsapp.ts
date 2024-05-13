import axios from "axios";
import config from "@/config";
import { logtailLogger } from "@/helpers/loggers";

export class Whatsapp {
  private static BOT_API_PORT = config.INTERNAL.BOT_API_PORT;
  private static BOT_API_BASE_URL = config.INTERNAL.BOT_API_BASE_URL;

  static async send(number: string, message: string) {
    try {
      const url = `http://localhost:${this.BOT_API_PORT}${this.BOT_API_BASE_URL}/messages`;
      const response = await axios.post(url, { number, message });

      if (response.status !== 200) throw response;
    } catch (e: any) {
      if (config.LOG.LEVEL === "debug") console.error(e);
      if (config.APP.ENV === "production")
        logtailLogger.warn({ err: e.data ?? e, code: "bot_whatsapp_api" });
    }
  }
}
