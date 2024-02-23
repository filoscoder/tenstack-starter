import { Router } from "express";
import { checkExact } from "express-validator";
import { TransactionsController } from "@/components/transactions";
import { validateTransferRequest } from "@/components/transactions/validators";
import { authenticatePlayer } from "@/components/players/validators";

const transactionsRouter = Router();

transactionsRouter.use(authenticatePlayer);
transactionsRouter.post(
  "/cashin",
  validateTransferRequest(),
  checkExact(),
  TransactionsController.cashin,
);
transactionsRouter.post(
  "/cashout",
  validateTransferRequest(),
  checkExact(),
  TransactionsController.cashout,
);

export default transactionsRouter;
