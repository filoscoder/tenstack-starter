import { WebPushError } from "web-push";
import { WebPushServices } from "@/components/web-push/services";
import { WebPushPayload } from "@/types/request/web-push";
import { WebPushDAO } from "@/db/web-push";
import CONFIG from "@/config";

/**
 * Web push notifications
 */
export class Notify {
  static async agent(payload: WebPushPayload) {
    try {
      const webPushServices = new WebPushServices();
      const subscriptions = await webPushServices.index();

      subscriptions.forEach(async (subscription) => {
        try {
          await webPushServices.send(subscription, payload);
        } catch (e: any) {
          if (e instanceof WebPushError) {
            if (e.statusCode === 404 || e.statusCode === 410) {
              await WebPushDAO.deleteByEndpoint(e.endpoint);
            }
          }
        }
      });
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
    }
  }
}
