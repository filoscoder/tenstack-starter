import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { BotController } from "@/components/bot/controller";
import {
  validateBlacklistRequest,
  validateQrName,
  validateSwitchRequest,
} from "@/components/bot/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireAgentRole } from "@/middlewares/auth";

const botRouter = Router();

botRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
botRouter.use(requireAgentRole);
botRouter.post(
  "/blacklist",
  validateBlacklistRequest(),
  checkExact(),
  throwIfBadRequest,
  BotController.blacklist,
);
botRouter.get("/blacklist", BotController.showBlacklist);
botRouter.post(
  "/switch",
  validateSwitchRequest(),
  checkExact(),
  throwIfBadRequest,
  BotController.switch,
);
botRouter.get("/switch", BotController.showSwitchState);
botRouter.get(
  "/:name?",
  validateQrName(),
  checkExact(),
  throwIfBadRequest,
  BotController.index,
);

export default botRouter;
