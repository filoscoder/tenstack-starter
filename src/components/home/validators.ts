import { query } from "express-validator";
import CONFIG from "@/config";

const appKeys = Object.keys(CONFIG.APP).map((key) => key.toLocaleLowerCase());

export const appKeyValidator = [
  query("key")
    .optional()
    .isString()
    .isIn(appKeys)
    .withMessage("`name` should be string type"),
];
