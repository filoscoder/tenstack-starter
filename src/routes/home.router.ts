import { Router } from "express";
import { HomeController } from "@/components/home";

const homeRouter = Router();

// const router = Router();
// router.get("/", HomeController.getAppInfo);

homeRouter.get("/", HomeController.getAppInfo);

export default homeRouter;
