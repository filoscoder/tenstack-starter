import { Router } from "express";
import passport from "passport";
import { checkExact } from "express-validator";
import { requireCashierRole } from "@/middlewares/auth";
import { CashierController } from "@/components/cashier/controller";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import {
  isKeyOfPlayer,
  validateResourceSearchRequest,
} from "@/components/players/validators";
import {
  validateCashierId,
  validateHandleUpdateRequest,
  validatePlayerId,
} from "@/components/cashier/validator";

const cashierRouter = Router();

cashierRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
cashierRouter.use(requireCashierRole);
cashierRouter.get(
  "/:id/player",
  validateCashierId(),
  validateResourceSearchRequest(isKeyOfPlayer),
  checkExact(),
  throwIfBadRequest,
  CashierController.listPlayers,
);
cashierRouter.get(
  "/:id/player/:player_id",
  validateCashierId(),
  validatePlayerId(),
  checkExact(),
  throwIfBadRequest,
  CashierController.showPlayer,
);
cashierRouter.get(
  "/:id/balance",
  validateCashierId(),
  checkExact(),
  throwIfBadRequest,
  CashierController.showBalance,
);
// cashierRouter.get(
//   "/:id/cashout",
//   validateCashierId(),
//   checkExact(),
//   throwIfBadRequest,
//   CashierController.cashout,
// );
cashierRouter.post(
  "/:id/update",
  validateCashierId(),
  validateHandleUpdateRequest(),
  checkExact(),
  throwIfBadRequest,
  CashierController.update,
);

export default cashierRouter;
