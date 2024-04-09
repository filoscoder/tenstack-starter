import { Router } from "express";
import passport from "passport";
import { checkExact } from "express-validator";
import { WebPushController } from "@/components/web-push/controller";
import { requireAgentRole } from "@/middlewares/auth";
import {
  validateDeleteRequest,
  validatePushSubscriptionRequest,
} from "@/components/web-push/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const webPushRouter = Router();

webPushRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
webPushRouter.use(requireAgentRole);
webPushRouter.get("/pubkey", WebPushController.index);
webPushRouter.post(
  "/subscription",
  validatePushSubscriptionRequest(),
  checkExact(),
  throwIfBadRequest,
  WebPushController.create,
);
webPushRouter.post(
  "/delete",
  validateDeleteRequest(),
  checkExact(),
  throwIfBadRequest,
  WebPushController.delete,
);

export default webPushRouter;
