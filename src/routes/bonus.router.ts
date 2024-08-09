import { Router } from "express";
import passport from "passport";
import { checkExact } from "express-validator";
import { BonusController } from "@/components/bonus/controller";
import {
  requireAgentRole,
  requireUserOrAgentRole,
  requireUserRole,
} from "@/middlewares/auth";
import { validateResourceSearchRequest } from "@/components/players/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import {
  isKeyOfBonus,
  validateBonusCreateRequest,
  validateBonusId,
} from "@/components/bonus/validators";

const bonusRouter = Router();

bonusRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
bonusRouter.get(
  "/",
  requireAgentRole,
  validateResourceSearchRequest(isKeyOfBonus),
  checkExact(),
  throwIfBadRequest,
  BonusController.index,
);
bonusRouter.get(
  "/:id",
  requireUserOrAgentRole,
  validateBonusId(),
  checkExact(),
  throwIfBadRequest,
  BonusController.show,
);
bonusRouter.use(requireUserRole);
bonusRouter.get(
  "/:id/redeem",
  validateBonusId(),
  checkExact(),
  throwIfBadRequest,
  BonusController.redeem,
);
bonusRouter.post(
  "/",
  validateBonusCreateRequest(),
  checkExact(),
  throwIfBadRequest,
  BonusController.create,
);

export default bonusRouter;
