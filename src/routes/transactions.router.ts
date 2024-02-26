import { Router } from "express";
import { checkExact } from "express-validator";
import { TransactionsController } from "@/components/transactions";
import {
  validateDepositRequest,
  validateTransferRequest,
} from "@/components/transactions/validators";
import { authenticatePlayer } from "@/components/players/validators";

const transactionsRouter = Router();

transactionsRouter.use(authenticatePlayer);
transactionsRouter.post(
  "/deposit/:id?",
  validateDepositRequest(),
  checkExact(),
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
  TransactionsController.cashout,
);

export default transactionsRouter;
