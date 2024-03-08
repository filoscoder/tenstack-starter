import { Router } from "express";
import passport from "passport";
import { AuthController } from "@/components/auth/controller";
import { validateToken } from "@/components/auth/validators";

const authRouter = Router();

authRouter.post("/refresh", validateToken(), AuthController.refresh);
authRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
authRouter.post("/logout", validateToken(), AuthController.logout);

export default authRouter;
