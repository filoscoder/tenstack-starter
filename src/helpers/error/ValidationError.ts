import { BAD_REQUEST } from "http-status/lib";
import { ValidationError as ValidatorError } from "express-validator";
import { CustomError } from "./CustomError";

class ValidationError extends CustomError {
  constructor(validationErrors: ValidatorError[]) {
    super({
      status: BAD_REQUEST,
      code: "bad_request",
      description: validationErrors,
    });
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export default ValidationError;
