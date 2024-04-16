import { NOT_FOUND } from "http-status/lib";
import { CustomError } from "./CustomError";

class NotFoundException extends CustomError {
  constructor(description = "") {
    super({ status: NOT_FOUND, code: "not_found", description });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default NotFoundException;
