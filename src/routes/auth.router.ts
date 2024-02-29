import { Router } from "express";
import { AuthController } from "@/components/auth/controller";

const authRouter = Router();

authRouter.post("/refresh", AuthController.refresh);

export default authRouter;
