import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import {
  requireAgentRole,
  requireUserOrAgentRole,
  requireUserRole,
} from "@/middlewares/auth";
import { depositRateLimiter } from "@/middlewares/rate-limiters/deposit";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { AgentController } from "@/components/agent/controller";
import {
  isKeyOfDeposit,
  validateDepositIndex,
  validateDepositRequest,
  validateDepositSetStatusRequest,
} from "@/components/deposits/validators";
import { DepositController } from "@/components/deposits/controller";
import { validateResourceSearchRequest } from "@/components/players/validators";

const depositsRouter = Router();

depositsRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
depositsRouter.get(
  "/deposit/pending",
  requireUserRole,
  DepositController.getPending,
);
depositsRouter.post(
  "/deposit/:id?",
  requireUserOrAgentRole,
  validateDepositRequest(),
  checkExact(),
  throwIfBadRequest,
  depositRateLimiter,
  DepositController.upsert,
);
depositsRouter.get(
  "/bank-details",
  requireUserRole,
  AgentController.getBankAccount,
);

depositsRouter.use(requireAgentRole);

depositsRouter.get(
  "/deposit/:id",
  validateDepositIndex(),
  checkExact(),
  throwIfBadRequest,
  DepositController.show,
);
depositsRouter.post(
  "/deposit/:id/set-status",
  validateDepositIndex(),
  validateDepositSetStatusRequest(),
  checkExact(),
  throwIfBadRequest,
  DepositController.setStatus,
);
depositsRouter.get(
  "/deposit",
  validateResourceSearchRequest(isKeyOfDeposit),
  checkExact(),
  throwIfBadRequest,
  DepositController.index,
);

export default depositsRouter;
