import { validationResult } from "express-validator";
import { ValidationError } from "@/helpers/error";

export const throwIfBadRequest = (req: Req, _res: Res, next: NextFn) => {
  const error = validationResult(req);
  if (!error.isEmpty()) throw new ValidationError(error.array());
  next();
};
