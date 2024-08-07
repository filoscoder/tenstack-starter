import { OK } from "http-status";
import { CoinTransferServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";

export class CoinTransferControler {
  static async releasePending(_req: Req, res: Res, next: NextFn) {
    try {
      // TODO
      //   const { id } = req.params;
      //   const { status } = req.body;
      //   const coinTransfer = await CoinTransferServices.releasePending(
      //     id,
      //     status,
      //   );
      const coinTransferServices = new CoinTransferServices();
      const coinTransfers = await coinTransferServices.releasePending();
      res.status(OK).json(apiResponse(coinTransfers));
    } catch (error) {
      next(error);
    }
  }
}
