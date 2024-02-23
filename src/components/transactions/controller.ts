import { TransferRequest } from "transactions";
import { FinanceServices } from "./services";

export class TransactionsController {
  static cashin = async (req: AuthedReq, res: Res, next: NextFn) => {
    const request: TransferRequest = req.body;
    // Panel ID needed for transfer
    const player = req.user!;

    try {
      const result = await FinanceServices.cashIn(player, request);

      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  static cashout = async (req: AuthedReq, res: Res, next: NextFn) => {
    const request: TransferRequest = req.body;
    const player = req.user!;

    try {
      const result = await FinanceServices.cashOut(player, request);

      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}
