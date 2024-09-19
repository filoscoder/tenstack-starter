import { ReadStream, createReadStream, existsSync } from "fs";
import { OK } from "http-status";
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
        res.status(OK).json(apiResponse(bots));
      } else {
        const paths = CONFIG.BOT.QR_PATHS.trim().split("\n");
        const path = paths.find((path) => path.includes(name));
        if (!path || !existsSync(path)) {
          throw new NotFoundException(`${name}.qr.png not found`);
        }

        fileStream = createReadStream(path);

        res.writeHead(OK, { "Content-Type": "image/png" });
        fileStream.pipe(res);
      }
    } catch (error) {
      next(error);
    }
  }

  static async blacklist(req: Req, res: Res, next: NextFn) {
    try {
      const { number, method } = req.body;

      const blacklisted = await BotServices.blacklist(number, method);
      res.status(blacklisted.status).send();
    } catch (error) {
      next(error);
    }
  }

  static async showBlacklist(_req: Req, res: Res, next: NextFn) {
    try {
      const blacklist = await BotServices.showBlacklist();
      res.status(OK).json(apiResponse(blacklist));
    } catch (error) {
      next(error);
    }
  }

  static async switch(req: Req, res: Res, next: NextFn) {
    try {
      const { state } = req.body;
      const result = await BotServices.switch(state);
      res.status(result.status).send();
    } catch (error) {
      next(error);
    }
  }

  static async showSwitchState(_req: Req, res: Res, next: NextFn) {
    try {
      const state = await BotServices.showSwitchState();
      res.status(OK).json(apiResponse(state));
    } catch (error) {
      next(error);
    }
  }
}
