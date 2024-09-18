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

      const { count } = (await BotHistoryDAO.count())[0];
      console.log("TOTAL", count);

      res.status(OK).json(apiResponse({ result, total: Number(count) }));
    } catch (e) {
      next(e);
    }
  }
}
