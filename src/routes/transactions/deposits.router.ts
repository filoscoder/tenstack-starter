import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { requireUserRole } from "@/middlewares/auth";
import { depositRateLimiter } from "@/middlewares/rate-limiters/deposit";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { AgentController } from "@/components/agent/controller";
import { validateDepositRequest } from "@/components/deposits/validators";
import { DepositController } from "@/components/deposits/controller";

const depositsRouter = Router();

depositsRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
depositsRouter.use(requireUserRole);
depositsRouter.get("/deposit/pending", DepositController.index);
depositsRouter.post(
  "/deposit/:id?",
  validateDepositRequest(),
  checkExact(),
  throwIfBadRequest,
  depositRateLimiter,
  DepositController.create,
);
depositsRouter.get("/bank-details", AgentController.getBankAccount);

export default depositsRouter;
