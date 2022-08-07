import HttpStatus, { INTERNAL_SERVER_ERROR } from "http-status/lib";

class APIError extends Error {
  readonly status: number;
  readonly message: string;
  readonly error: any | undefined;

  constructor(message: string | null, error?: any) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = INTERNAL_SERVER_ERROR;
    this.message = message || (HttpStatus[INTERNAL_SERVER_ERROR] as string);
    if (error && error instanceof Error) {
      this.error = {
        type: error?.name,
        message: error?.message,
        stack: error?.stack,
      };
    }

    Error.captureStackTrace(this);
  }
}

export default APIError;
