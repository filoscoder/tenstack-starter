import { ReadStream, createReadStream, existsSync } from "fs";
import { BotServices } from "./services";
import CONFIG from "@/config";
import { NotFoundException } from "@/helpers/error";
import { apiResponse } from "@/helpers/apiResponse";

export class BotController {
  static async index(req: Req, res: Res, next: NextFn) {
    const { name } = req.params;
    let fileStream: ReadStream | undefined = undefined;
    try {
      if (!name) {
        const bots = BotServices.showNames();
        res.status(200).json(apiResponse(bots));
      } else {
        const paths = CONFIG.BOT.QR_PATHS.trim().split("\n");
        const path = paths.find((path) => path.includes(name));
        if (!path || !existsSync(path)) {
          throw new NotFoundException(`${name}.qr.png not found`);
        }

        fileStream = createReadStream(path);

        res.writeHead(200, { "Content-Type": "image/png" });
        fileStream.pipe(res);
      }
    } catch (error) {
      next(error);
    }
  }
}
