import { Router } from "express";
import { checkExact } from "express-validator";
import { TransactionsController } from "@/components/transactions";
import {
  validateDepositId,
  validateTransferRequest,
} from "@/components/transactions/validators";
import { authenticatePlayer } from "@/components/players/validators";

const transactionsRouter = Router();

transactionsRouter.use(authenticatePlayer);
transactionsRouter.post(
  "/deposit",
  validateTransferRequest(),
  checkExact(),
  TransactionsController.deposit,
);
transactionsRouter.put(
  "/deposit/:id/confirm",
  validateDepositId(),
  checkExact(),
  TransactionsController.confirmDeposit,
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
  TransactionsController.cashout,
);

export default transactionsRouter;
