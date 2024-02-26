import { OK } from "http-status";
import { FinanceServices } from "./services";
import { TransferRequest } from "@/types/request/transfers";
import { apiResponse } from "@/helpers/apiResponse";

export class TransactionsController {
  static deposit = async (req: AuthedReq, res: Res, next: NextFn) => {
    const request: TransferRequest = req.body;
    // Panel ID needed for transfer
    const player = req.user!;

    try {
      const result = await FinanceServices.cashIn(player, request);

      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };

  static cashout = async (req: AuthedReq, res: Res, next: NextFn) => {
    const request: TransferRequest = req.body;
    const player = req.user!;

    try {
      const result = await FinanceServices.cashOut(player, request);

      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };

  static confirmDeposit = async (req: AuthedReq, res: Res, next: NextFn) => {
    const player = req.user!;
    const deposit_id = Number(req.params.id);

    try {
      const deposit = await FinanceServices.confirmDeposit(deposit_id, player);
      res.status(OK).json(apiResponse(deposit));
    } catch (err) {
      next(err);
    }
  };

  static pendingDeposits = async (req: AuthedReq, res: Res, next: NextFn) => {
    const player = req.user!;

    try {
      const deposits = await FinanceServices.showPendingDeposits(player.id);
      res.status(OK).json(apiResponse(deposits));
    } catch (err) {
      next(err);
    }
  };

  static deleteDeposit = async (req: AuthedReq, res: Res, next: NextFn) => {
    const player = req.user!;
    const deposit_id = Number(req.params.id);

    try {
      await FinanceServices.deleteDeposit(deposit_id, player.id);
      res.send();
    } catch (err) {
      next(err);
    }
  };
}
