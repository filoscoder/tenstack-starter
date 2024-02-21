import { Router } from "express";
import { checkExact } from "express-validator";
import { BankAccountsController } from "@/components/bank-accounts/controller";
import {
  authenticatePlayer,
  authorizeBankAccountDelete,
  authorizeBankAccountUpdate,
  validateAccountUpdate,
  validateBankAccount,
} from "@/components/bank-accounts/validators";

const bankAccountsRouter = Router();

bankAccountsRouter.use(authenticatePlayer);
bankAccountsRouter.get("/:id?", BankAccountsController.index);
bankAccountsRouter.post(
  "/",
  validateBankAccount(),
  checkExact(),
  BankAccountsController.create,
);
bankAccountsRouter.put(
  "/:id",
  validateAccountUpdate(),
  checkExact(),
  authorizeBankAccountUpdate,
  BankAccountsController.update,
);
bankAccountsRouter.delete(
  "/:id",
  authorizeBankAccountDelete,
  BankAccountsController.delete,
);

export default bankAccountsRouter;
