import HttpStatus, { NOT_FOUND } from "http-status/lib";

class NotFoundException {
  readonly status: number;
  readonly message: string;

  constructor() {
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = NOT_FOUND;
    this.message = HttpStatus[NOT_FOUND] as string;
  }
}

export default NotFoundException;
