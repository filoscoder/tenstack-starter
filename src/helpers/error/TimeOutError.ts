import httpStatus, { REQUEST_TIMEOUT } from "http-status/lib";
import CONFIG from "@/config";

class TimeOutError {
  readonly status: number;
  readonly message: string;
  readonly timeout: string | number;
  readonly path: string;

  constructor(path: string) {
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = REQUEST_TIMEOUT;
    this.message = httpStatus[REQUEST_TIMEOUT] as string;
    this.timeout = CONFIG.SERVER.TIMEOUT;
    this.path = path;
  }
}

export default TimeOutError;
