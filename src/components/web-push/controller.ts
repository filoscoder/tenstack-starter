import { CREATED, OK } from "http-status";
import { WebPushServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";
import { WebPushSubscription } from "@/types/request/web-push";

export class WebPushController {
  /**
   * Show public key
   */
  static index(_req: Req, res: Res, next: NextFn) {
    try {
      const webPushServices = new WebPushServices();
      const key = webPushServices.getPublicKey();

      res.status(OK).send(apiResponse(key));
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Req, res: Res, next: NextFn) {
    const subscription: WebPushSubscription = req.body;
    try {
      const webPushServices = new WebPushServices();
      await webPushServices.create(subscription);

      res.status(CREATED).send();
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Req, res: Res, next: NextFn) {
    const { endpoint } = req.body;
    try {
      const webPushServices = new WebPushServices();
      await webPushServices.delete(endpoint);

      res.status(OK).send();
    } catch (e) {
      next(e);
    }
  }
}
