import * as webpush from "web-push";
import { WebPushDAO } from "@/db/web-push";
import { CustomError } from "@/middlewares/errorHandler";
import { WebPushPayload, WebPushSubscription } from "@/types/request/web-push";
import { parseSubscription } from "@/utils/parser";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";

export class WebPushServices {
  /**
   * Get all subscriptions
   */
  async index(): Promise<WebPushSubscription[]> {
    const subs = await WebPushDAO.findAll();
    const result: WebPushSubscription[] = subs.map((sub) =>
      parseSubscription(sub),
    );

    return result;
  }
  getPublicKey(): string {
    if (!CONFIG.AUTH.WEB_PUSH_PUBLIC_KEY) {
      throw new CustomError(ERR.KEY_NOT_FOUND);
    }
    return CONFIG.AUTH.WEB_PUSH_PUBLIC_KEY;
  }

  /**
   * Subscribe a device
   */
  async create(subscription: WebPushSubscription): Promise<void> {
    await WebPushDAO.upsert(
      subscription.endpoint,
      {
        keys: JSON.stringify(subscription.keys),
        expirationTime: subscription.expirationTime,
      },
      subscription,
    );
  }

  async delete(endpoint: string): Promise<void> {
    await WebPushDAO.deleteByEndpoint(endpoint);
  }

  async send(sub: WebPushSubscription, payload: WebPushPayload) {
    return webpush.sendNotification(sub, JSON.stringify(payload), {
      vapidDetails: {
        subject: "mailto:contact@rodrigoalvarez.co.uk",
        publicKey: CONFIG.AUTH.WEB_PUSH_PUBLIC_KEY!,
        privateKey: CONFIG.AUTH.WEB_PUSH_PRIVATE_KEY!,
      },
    });
  }
}
