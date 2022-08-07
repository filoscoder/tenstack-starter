import HttpStatus, { UNAUTHORIZED } from "http-status/lib";

class UnauthorizedError {
  readonly status: number;
  readonly message: string;

  constructor(message: string) {
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = UNAUTHORIZED;
    this.message = message || (HttpStatus[UNAUTHORIZED] as string);
  }
}

export default UnauthorizedError;
