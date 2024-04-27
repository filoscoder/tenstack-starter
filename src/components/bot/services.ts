import CONFIG from "@/config";
import { NotFoundException } from "@/helpers/error";

export class BotServices {
  static showNames(): string[] {
    const paths = CONFIG.BOT.QR_PATHS.trim().split("\n");
    const names = paths.map(
      (path) => path.split(".")[0].split("/").pop() ?? "",
    );
    if (!names.length) throw new NotFoundException("QR_PATHS not found");
    return names;
  }
}
