import { Router } from "express";
import passport from "passport";
import { AuthController } from "@/components/auth/controller";
import { validateToken } from "@/components/auth/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const authRouter = Router();

authRouter.post(
  "/refresh",
  validateToken(),
  throwIfBadRequest,
  AuthController.refresh,
);
authRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
authRouter.post(
  "/logout",
  validateToken(),
  throwIfBadRequest,
  AuthController.logout,
);

export default authRouter;
