import { Router } from "express";
import passport from "passport";
import { checkExact } from "express-validator";
import { AuthController } from "@/components/auth/controller";
import { validateToken } from "@/components/auth/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const authRouter = Router();

authRouter.post(
  "/refresh",
  validateToken(),
  checkExact(),
  throwIfBadRequest,
  AuthController.refresh,
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

export default authRouter;
