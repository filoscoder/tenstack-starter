import { OK } from "http-status";
import { FinanceServices } from "./services";
import { CashoutRequest, DepositRequest } from "@/types/request/transfers";
import { apiResponse } from "@/helpers/apiResponse";
import { DepositsDAO } from "@/db/deposits";
import { NotFoundException } from "@/helpers/error";
import { CoinTransferResult } from "@/types/response/transfers";

export class TransactionsController {
  static deposit = async (req: AuthedReq, res: Res, next: NextFn) => {
    const deposit_id = Number(req.params.id);
    const request: Omit<DepositRequest, "player_id"> = req.body;
    const player = req.user!;

    const financeServices = new FinanceServices();
    try {
      let result: CoinTransferResult;
      if (isNaN(deposit_id)) {
        result = await financeServices.deposit(player, request);
      } else {
        const deposit = await DepositsDAO.getById(deposit_id);
        if (!deposit) throw new NotFoundException();

        result = await financeServices.confirmDeposit(
          player,
          deposit_id,
          request,
        );
      }

      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };

  static cashout = async (req: AuthedReq, res: Res, next: NextFn) => {
    const request: CashoutRequest = req.body;
    const player = req.user!;

    try {
      const financeServices = new FinanceServices();
      const result = await financeServices.cashOut(player, request);

      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
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
