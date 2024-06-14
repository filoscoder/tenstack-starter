import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { requireAgentRole, requireUserRole } from "@/middlewares/auth";
import { depositRateLimiter } from "@/middlewares/rate-limiters/deposit";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { AgentController } from "@/components/agent/controller";
import {
  isKeyOfDeposit,
  validateDepositIndex,
  validateDepositRequest,
  validateDepositUpdate,
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
  DepositController.pending,
);
depositsRouter.post(
  "/deposit/:id?",
  requireUserRole,
  validateDepositRequest(),
  checkExact(),
  throwIfBadRequest,
  depositRateLimiter,
  DepositController.create,
);
depositsRouter.get(
  "/bank-details",
  requireUserRole,
  AgentController.getBankAccount,
);

depositsRouter.use(requireAgentRole);

depositsRouter.get(
  "/deposit/pending-coin-transfers",
  DepositController.pendingCoinTransfers,
);
depositsRouter.get(
  "/deposit/:id",
  validateDepositIndex(),
  throwIfBadRequest,
  DepositController.show,
);
depositsRouter.get(
  "/deposit",
  validateResourceSearchRequest(isKeyOfDeposit),
  checkExact(),
  throwIfBadRequest,
  DepositController.index,
);
depositsRouter.post(
  "/deposit/:id",
  validateDepositUpdate(),
  throwIfBadRequest,
  DepositController.create,
);

export default depositsRouter;
