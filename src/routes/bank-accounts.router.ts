import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { BankAccountsController } from "@/components/bank-accounts/controller";
import {
  validateAccountUpdate,
  validateBankAccount,
  validateBankAccountIndex,
} from "@/components/bank-accounts/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireUserRole } from "@/middlewares/auth";

const bankAccountsRouter = Router();

bankAccountsRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
bankAccountsRouter.use(requireUserRole);
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
bankAccountsRouter.post(
  "/:id",
  validateAccountUpdate(),
  checkExact(),
  throwIfBadRequest,
  BankAccountsController.update,
);
bankAccountsRouter.post(
  "/:id/delete",
  validateBankAccountIndex(),
  checkExact(),
  throwIfBadRequest,
  BankAccountsController.delete,
);

export default bankAccountsRouter;
