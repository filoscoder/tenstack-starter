import { CREATED, OK } from "http-status";
import { Analytics } from "@prisma/client";
import { AnalyticsServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";
import { AnalyticsDAO } from "@/db/analytics";
import { AnalyticsCreateRequest } from "@/types/request/analytics";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";

export class AnalyticsController {
  static async index(req: Req, res: Res, next: NextFn) {
    try {
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<Analytics>(req);

      const analyticsServices = new AnalyticsServices();
      const result = await analyticsServices.getAll(
        page,
        itemsPerPage,
        search,
        orderBy,
      );
      const total = await AnalyticsDAO.count;

      res.status(OK).send(apiResponse({ result, total }));
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Req, res: Res, next: NextFn) {
    try {
      const analytics = await AnalyticsDAO._getById(req.params.id);

      res.status(OK).send(apiResponse(analytics));
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Req, res: Res, next: NextFn) {
    try {
      const data: AnalyticsCreateRequest = req.body;
      const analytics = await AnalyticsDAO.create(data);

      res.status(CREATED).send(apiResponse(analytics));
    } catch (e) {
      next(e);
    }
  }

  static async summary(_req: Req, res: Res, next: NextFn) {
    try {
      const analyticsServices = new AnalyticsServices();
      const summary = await analyticsServices.summary();

      res.status(OK).send(apiResponse(summary));
    } catch (e) {
      next(e);
    }
  }
}
