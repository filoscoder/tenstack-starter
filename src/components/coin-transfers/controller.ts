import { OK } from "http-status";
import { CoinTransferServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";

export class CoinTransferControler {
  static async releasePending(_req: Req, res: Res, next: NextFn) {
    try {
      const coinTransferServices = new CoinTransferServices();
      const coinTransfers = await coinTransferServices.releasePending();
      res.status(OK).json(apiResponse(coinTransfers));
    } catch (error) {
      next(error);
    }
  }

  static async getPendingTotal(_req: Req, res: Res, next: NextFn) {
    try {
      const coinTransferServices = new CoinTransferServices();
      const amount = await coinTransferServices.getPendingTotal();
      res.status(OK).json(apiResponse(amount));
    } catch (error) {
      next(error);
    }
  }
}
