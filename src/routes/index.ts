import { Router } from "express";
import { HomeController, appKeyValidator } from "@/components/home";
import { sanitizer } from "@/helpers";

const router = Router();

router.get("/", sanitizer(appKeyValidator), HomeController.getAppInfo);

export default router;
