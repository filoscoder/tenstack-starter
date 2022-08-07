import HttpStatus, { BAD_REQUEST } from "http-status/lib";

class ValidationError extends Error {
  readonly status: number;
  readonly message: string;
  readonly details: Record<string, any>;

  constructor(validationErrors: Record<string, any>) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = BAD_REQUEST;
    this.message = HttpStatus[BAD_REQUEST] as string;
    this.details = validationErrors;

    Error.captureStackTrace(this);
  }
}

export default ValidationError;
