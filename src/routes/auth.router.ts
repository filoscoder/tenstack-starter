import { Router } from "express";
import { AuthController } from "@/components/auth/controller";
import { validateToken } from "@/components/auth/validators";

const authRouter = Router();

authRouter.post("/refresh", validateToken(), AuthController.refresh);
authRouter.post("/logout", validateToken(), AuthController.logout);

export default authRouter;
