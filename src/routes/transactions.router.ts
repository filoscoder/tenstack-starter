import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { TransactionsController } from "@/components/transactions";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireUserRole } from "@/middlewares/auth";
import {
  validateCashoutRequest,
  validateDepositRequest,
  validateDepositId,
} from "@/components/transactions/validators";

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
  TransactionsController.deposit,
);
transactionsRouter.get(
  "/deposit/pending",
  TransactionsController.pendingDeposits,
);
transactionsRouter.delete(
  "/deposit/:id",
  validateDepositId(),
  throwIfBadRequest,
  TransactionsController.deleteDeposit,
);
transactionsRouter.post(
  "/cashout",
  validateCashoutRequest(),
  checkExact(),
  throwIfBadRequest,
  TransactionsController.cashout,
);

export default transactionsRouter;
