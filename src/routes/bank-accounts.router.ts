import { Router } from "express";
import { checkExact } from "express-validator";
import { BankAccountsController } from "@/components/bank-accounts/controller";
import {
  validateAccountUpdate,
  validateBankAccount,
  validateBankAccountIndex,
} from "@/components/bank-accounts/validators";
import { authenticatePlayer } from "@/components/players/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const bankAccountsRouter = Router();

bankAccountsRouter.use(authenticatePlayer);
bankAccountsRouter.get(
  "/:id?",
  validateBankAccountIndex(),
  checkExact(),
  throwIfBadRequest,
  BankAccountsController.index,
);
bankAccountsRouter.post(
  "/",
  validateBankAccount(),
  checkExact(),
  throwIfBadRequest,
  BankAccountsController.create,
);
bankAccountsRouter.put(
  "/:id",
  validateAccountUpdate(),
  checkExact(),
  throwIfBadRequest,
  BankAccountsController.update,
);
bankAccountsRouter.delete(
  "/:id",
  validateBankAccountIndex(),
  checkExact(),
  throwIfBadRequest,
  BankAccountsController.delete,
);

export default bankAccountsRouter;
