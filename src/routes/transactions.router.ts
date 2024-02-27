import { Router } from "express";
import { checkExact } from "express-validator";
import { TransactionsController } from "@/components/transactions";
import {
  // validateDepositRequest,
  validateTransferRequest,
} from "@/components/transactions/validators";
import { authenticatePlayer } from "@/components/players/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const transactionsRouter = Router();

transactionsRouter.use(authenticatePlayer);
transactionsRouter.post(
  "/deposit/:id?",
  validateTransferRequest(),
  checkExact(),
  throwIfBadRequest,
  TransactionsController.deposit,
);
transactionsRouter.get(
  "/deposit/pending",
  TransactionsController.pendingDeposits,
);
transactionsRouter.delete("/deposit/:id", TransactionsController.deleteDeposit);
transactionsRouter.post(
  "/cashout",
  validateTransferRequest(),
  checkExact(),
  throwIfBadRequest,
  TransactionsController.cashout,
);

export default transactionsRouter;
