import { Result, ValidationChain, validationResult } from "express-validator";
import { Middleware as ValidatorMiddleware } from "express-validator/src/base";
import ValidationError from "./error/ValidationError";

type MultiValidatorChain = ValidatorMiddleware & {
  run: (req: Request) => Promise<Result>;
};

const catchValidatorError = (req: Req, _: Res, next: NextFn): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors
      .array()
      .reduce(
        (
          obj: Record<string, string>,
          error: Record<string, any>,
        ): Record<string, any> => {
          obj[error.param] = error.msg;
          return obj;
        },
        {},
      );
    throw new ValidationError(validationErrors);
  }
  next();
};

export const sanitizer = (
  validator: (ValidationChain | MultiValidatorChain)[],
) => [...validator, catchValidatorError];
