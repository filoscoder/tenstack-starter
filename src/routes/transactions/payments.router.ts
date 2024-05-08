import { Router } from "express";
import { checkExact } from "express-validator";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { validateCashoutRequest } from "@/components/payments/validator";
import { PaymentController } from "@/components/payments/controller";

const paymentsRouter = Router();

paymentsRouter.post(
  "/cashout",
  validateCashoutRequest(),
  checkExact(),
  throwIfBadRequest,
  PaymentController.create,
);
export default paymentsRouter;
