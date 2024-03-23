import { CREATED, OK } from "http-status";
import { BankAccountServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";
import { BankAccountRequest } from "@/types/request/bank-account";

export class BankAccountsController {
  static index = async (req: AuthedReq, res: Res, next: NextFn) => {
    try {
      const player_id = req.user!.id;
      const account_id = Number(req.params.id);
      const bankAccountServices = new BankAccountServices();

      let result = [];
      if (account_id) {
        result[0] = await bankAccountServices.show(account_id, player_id);
      } else {
        result = await bankAccountServices.index(player_id);
      }

      res.status(OK).json(apiResponse(result));
    } catch (error) {
      next(error);
    }
  };

  static create = async (req: AuthedReq, res: Res, next: NextFn) => {
    try {
      const player_id = req.user!.id;
      const request: BankAccountRequest = req.body;

      const bankAccountServices = new BankAccountServices();

      const account = await bankAccountServices.create(player_id, request);

      res.status(CREATED).json(apiResponse(account));
    } catch (error) {
      next(error);
    }
  };

  static update = async (req: AuthedReq, res: Res, next: NextFn) => {
    try {
      const request: BankAccountRequest = req.body;
      const account_id = Number(req.params.id);

      const bankAccountServices = new BankAccountServices();

      const account = await bankAccountServices.update(
        account_id,
        req.user!.id,
        request,
      );

      res.status(OK).json(apiResponse(account));
    } catch (error) {
      next(error);
    }
  };

  static delete = async (req: AuthedReq, res: Res, next: NextFn) => {
    try {
      const account_id = Number(req.params.id);

      const bankAccountServices = new BankAccountServices();

      await bankAccountServices.delete(account_id, req.user!.id);

      res.status(OK).send();
    } catch (error) {
      next(error);
    }
  };
}
