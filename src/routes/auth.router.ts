import { Router } from "express";
import passport from "passport";
import { checkExact } from "express-validator";
import { AuthController } from "@/components/auth/controller";
import { validateToken } from "@/components/auth/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireUserRole } from "@/middlewares/auth";
import { NewPasswordController } from "@/components/new-password/controller";
import {
  validateForgotPasswordRequest,
  validateResetRequest,
  validateRestorePasswordRequest,
} from "@/components/new-password/validators";
import { forgotPasswordRateLimiter } from "@/middlewares/rate-limiters/pass-restore-request";

const authRouter = Router();

authRouter.post(
  "/refresh",
  validateToken(),
  checkExact(),
  throwIfBadRequest,
  AuthController.refresh,
);
authRouter.post(
  "/forgot-password",
  validateForgotPasswordRequest(),
  checkExact(),
  throwIfBadRequest,
  forgotPasswordRateLimiter,
  NewPasswordController.create,
);
authRouter.post(
  "/restore-password",
  validateRestorePasswordRequest(),
  validateResetRequest(),
  checkExact(),
  throwIfBadRequest,
  NewPasswordController.store,
);
authRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
authRouter.post(
  "/logout",
  validateToken(),
  checkExact(),
  throwIfBadRequest,
  AuthController.logout,
);
authRouter.use(requireUserRole);
authRouter.post(
  "/reset-password",
  validateResetRequest(),
  checkExact(),
  throwIfBadRequest,
  NewPasswordController.store,
);

export default authRouter;
