import { OK } from "http-status";
import { PaymentServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";
import { CashoutRequest } from "@/types/request/transfers";

export class PaymentController {
  static readonly create = async (req: AuthedReq, res: Res, next: NextFn) => {
    const request: CashoutRequest = req.body;
    const player = req.user!;

    try {
      const paymentServices = new PaymentServices();
      const result = await paymentServices.create(player, request);

      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };
}
