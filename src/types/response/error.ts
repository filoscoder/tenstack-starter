import { ValidationError } from "express-validator";

export type ErrorData = {
  status: number;
  code: string;
  description: string | ValidationError[];
  detail?: object;
};
