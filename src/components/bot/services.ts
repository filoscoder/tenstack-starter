import axios from "axios";
import CONFIG, { BLACKLIST_METHOD, GLOBAL_SWITCH_STATE } from "@/config";
import { NotFoundException } from "@/helpers/error";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";

export class BotServices {
  private static BASE_URL = CONFIG.INTERNAL.BOT_API_BASE_URL;

  static showNames(): string[] {
    const paths = CONFIG.BOT.QR_PATHS.trim().split("\n");
    const names = paths.map(
      (path) => path.split("/").pop()?.split(".")[0] ?? "",
    );
    if (!names.length) throw new NotFoundException("QR_PATHS not found");
    return names;
  }

  static blacklist(number: string, method: BLACKLIST_METHOD) {
    return axios.post(
      `${this.BASE_URL}/blacklist`,
      { number, method },
      { validateStatus: () => true },
    );
  }

  static async showBlacklist(): Promise<string[]> {
    const listResponse = await axios.get<string[]>(
      `${this.BASE_URL}/blacklist`,
      {
        validateStatus: () => true,
      },
    );

    if (listResponse.status !== 200) throw new CustomError(ERR.BOT_API_ERROR);

    return listResponse.data;
  }

  static async switch(state: GLOBAL_SWITCH_STATE) {
    const switchResponse = await axios.post(
      `${this.BASE_URL}/switch`,
      { state },
      { validateStatus: () => true },
    );

    if (switchResponse.status !== 200) throw new CustomError(ERR.BOT_API_ERROR);

    return switchResponse;
  }

  static async showSwitchState(): Promise<GLOBAL_SWITCH_STATE> {
    const stateResponse = await axios.get<GLOBAL_SWITCH_STATE>(
      `${this.BASE_URL}/switch`,
    );

    if (stateResponse.status !== 200) throw new CustomError(ERR.BOT_API_ERROR);

    return stateResponse.data;
  }
}
