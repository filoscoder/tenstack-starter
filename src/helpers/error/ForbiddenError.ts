import httpStatus, { FORBIDDEN } from "http-status/lib";
import { CustomError } from "./CustomError";

class ForbiddenError extends CustomError {
  constructor(description: string) {
    super({ status: FORBIDDEN, code: httpStatus[FORBIDDEN], description });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default ForbiddenError;
