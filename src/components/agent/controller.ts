import { join } from "path";
import { createReadStream } from "fs";
import { OK } from "http-status";
import { AgentServices } from "./services";
import { Credentials } from "@/types/request/players";
import { apiResponse } from "@/helpers/apiResponse";

export class AgentController {
  static async login(req: Req, res: Res, next: NextFn) {
    try {
      const credentials: Credentials = req.body;

      const token = await AgentServices.login(credentials);

      res.status(OK).json(apiResponse({ access: token }));
    } catch (error) {
      next(error);
    }
  }

  static async showPayments(_req: Req, res: Res, next: NextFn) {
    try {
      const payments = await AgentServices.showPayments();

      res.status(OK).json(apiResponse(payments));
    } catch (error) {
      next(error);
    }
  }

  static async markAsPaid(req: Req, res: Res, next: NextFn) {
    try {
      const { id } = req.params;

      const payment = await AgentServices.markAsPaid(Number(id));

      res.status(OK).json(apiResponse(payment));
    } catch (error) {
      next(error);
    }
  }

  static async showDeposits(_req: Req, res: Res, next: NextFn) {
    try {
      const deposits = await AgentServices.showDeposits();

      res.status(OK).json(apiResponse(deposits));
    } catch (error) {
      next(error);
    }
  }

  static async qr(_req: Req, res: Res, next: NextFn) {
    try {
      const PATH_QR = join(process.cwd(), `bot.qr.png`);
      const fileStream = createReadStream(PATH_QR);

      res.writeHead(200, { "Content-Type": "image/png" });
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
