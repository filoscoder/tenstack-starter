import HttpStatus, { UNAUTHORIZED } from "http-status/lib";
import { CustomError } from "./CustomError";

class UnauthorizedError extends CustomError {
  constructor(description: string) {
    super({
      status: UNAUTHORIZED,
      code: HttpStatus[UNAUTHORIZED],
      description,
    });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default UnauthorizedError;
