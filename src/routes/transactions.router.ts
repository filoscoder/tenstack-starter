import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { TransactionsController } from "@/components/transactions";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireUserRole } from "@/middlewares/auth";
import {
  validateCashoutRequest,
  validateDepositRequest,
} from "@/components/transactions/validators";
import { AgentController } from "@/components/agent";
import { depositRateLimiter } from "@/middlewares/rate-limiters/deposit";

const transactionsRouter = Router();

transactionsRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
transactionsRouter.use(requireUserRole);
transactionsRouter.post(
  "/deposit/:id?",
  validateDepositRequest(),
  checkExact(),
  throwIfBadRequest,
  depositRateLimiter,
  TransactionsController.deposit,
);
transactionsRouter.get(
  "/deposit/pending",
  TransactionsController.pendingDeposits,
);
transactionsRouter.post(
  "/cashout",
  validateCashoutRequest(),
  checkExact(),
  throwIfBadRequest,
  TransactionsController.cashout,
);
transactionsRouter.get("/bank-details", AgentController.getBankAccount);

export default transactionsRouter;
