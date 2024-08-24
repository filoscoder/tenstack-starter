import { Player } from "@prisma/client";
import { OK } from "http-status";
import { PlayerServices } from "../players/services";
import { CashierServices } from "./services";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";
import { apiResponse } from "@/helpers/apiResponse";
import { PlayersDAO } from "@/db/players";
import { CashierDAO } from "@/db/cashier";
import { CashierUpdateRequest } from "@/types/request/cashier";
import { RoledPlayer } from "@/types/response/players";

export class CashierController {
  static async listPlayers(req: Req, res: Res, next: NextFn) {
    try {
      const cashierId = req.params.id;
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<Player>(req);

      CashierDAO.authorizeListPlayers(cashierId, req.user!);

      const cashierServices = new CashierServices();
      const result = await cashierServices.listPlayers(
        page,
        itemsPerPage,
        search,
        orderBy,
        cashierId,
      );

      const total = await PlayersDAO.count({ cashier_id: cashierId });

      res.status(OK).send(apiResponse({ result, total }));
    } catch (error) {
      next(error);
    }
  }

  static async showPlayer(req: Req, res: Res, next: NextFn) {
    try {
      const cashierId = req.params.id;
      const playerId = req.params.player_id;
      const user = req.user!;

      await CashierDAO.authorizeShowPlayer(cashierId, playerId, user);

      const playerServices = new PlayerServices();
      const player = await playerServices.show<Player>(playerId);

      res.status(OK).send(apiResponse(player));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Req, res: Res, next: NextFn) {
    try {
      const cashierId = req.params.id;
      const user = req.user!;
      const request: CashierUpdateRequest = req.body;

      CashierDAO.authorizeUpdate(cashierId, user);

      const cashierServices = new CashierServices();
      const player = await cashierServices.update(cashierId, request);

      res.status(OK).send(apiResponse(player));
    } catch (error) {
      next(error);
    }
  }

  static async showBalance(req: Req, res: Res, next: NextFn) {
    try {
      const cashierId = req.params.id;
      const user: RoledPlayer = req.user!;

      CashierDAO.authorizeShow(cashierId, user);

      const cashierServices = new CashierServices();
      const balance = await cashierServices.showBalance(cashierId);

      res.status(OK).send(apiResponse(balance));
    } catch (error) {
      next(error);
    }
  }

  // static async cashout(req: Req, res: Res, next: NextFn) {
  //   try {
  //     const cashierId = req.params.id;
  //     const user: RoledPlayer = req.user!;

  //     CashierDAO.authorizeUpdate(cashierId, user);

  //     const cashierServices = new CashierServices();
  //     const result = await cashierServices.cashout(cashierId, user);

  //     res.status(OK).send(apiResponse(result));
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}
