import { OK } from "http-status";
import { BankAccount, Deposit, Payment, Player } from "@prisma/client";
import { PaymentServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";
import { CashoutRequest } from "@/types/request/transfers";
import { PaymentsDAO } from "@/db/payments";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";
import { hidePassword } from "@/utils/auth";

export class PaymentController {
  static readonly index = async (req: Req, res: Res, next: NextFn) => {
    try {
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<Deposit>(req);

      const paymentServices = new PaymentServices();
      const payments = await paymentServices.getAll<
        Payment & { Player: Player; BankAccount: BankAccount }
      >(page, itemsPerPage, search, orderBy);
      const result = payments.map((payment) => ({
        ...payment,
        Player: hidePassword(payment.Player),
      }));
      const total = await PaymentsDAO.count();

      res.status(OK).json(apiResponse({ result, total }));
    } catch (err) {
      next(err);
    }
  };

  static readonly create = async (req: Req, res: Res, next: NextFn) => {
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
