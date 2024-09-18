import { BotHistory } from "@prisma/client";
import { OK } from "http-status";
import { BotHistoryServices } from "./services";
import { BotHistoryDAO } from "@/db/bot-history";
import { apiResponse } from "@/helpers/apiResponse";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";

export class BotHistoryController {
  static async index(req: Req, res: Res, next: NextFn) {
    try {
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<BotHistory>(req);

      const botHistoryServices = new BotHistoryServices();
      const result = await botHistoryServices.getAll<BotHistory>(
        page,
        itemsPerPage,
        search,
        orderBy,
      );

      const total = await BotHistoryDAO.count();

      res.status(OK).json(apiResponse({ result, total }));
    } catch (e) {
      next(e);
    }
  }

  //   static async show(req: Req, res: Res, next: NextFn) {
  //     try {
  //     } catch (e) {
  //       next(e);
  //     }
  //   }
}
