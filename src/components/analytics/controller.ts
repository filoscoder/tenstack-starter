import { CREATED, OK } from "http-status";
import { apiResponse } from "@/helpers/apiResponse";
import { AnalyticsDAO } from "@/db/analytics";
import { AnalyticsCreateRequest } from "@/types/request/analytics";

export class AnalyticsController {
  static async index(_req: Req, res: Res, next: NextFn) {
    try {
      const analytics = await AnalyticsDAO.findMany();

      res.status(OK).send(apiResponse(analytics));
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Req, res: Res, next: NextFn) {
    try {
      const analytics = await AnalyticsDAO.getById(req.params.id);

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
}
