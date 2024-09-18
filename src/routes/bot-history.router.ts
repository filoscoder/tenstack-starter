import { Router } from "express";
import passport from "passport";
import { checkExact } from "express-validator";
import { requireAgentRole } from "@/middlewares/auth";
import { BotHistoryController } from "@/components/bot-history/controller";
import { validateResourceSearchRequest } from "@/components/players/validators";
import { isKeyOfBotHistory } from "@/components/bot-history/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const botHistoryRouter = Router();

botHistoryRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
botHistoryRouter.use(requireAgentRole);
botHistoryRouter.get(
  "/",
  validateResourceSearchRequest(isKeyOfBotHistory),
  checkExact(),
  throwIfBadRequest,
  BotHistoryController.index,
);

export default botHistoryRouter;
