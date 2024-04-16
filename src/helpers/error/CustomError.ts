import { ValidationError } from "express-validator";
import { ErrorData } from "@/types/response/error";

export class CustomError extends Error {
  public status: number;
  public code: string;
  public description: string | ValidationError[];
  /**
   * Extra info for logging
   */
  public detail?: object;

  constructor(err: ErrorData) {
    super();
    this.status = err.status;
    this.code = err.code;
    this.description = err.description;
    this.detail = err.detail;
  }
}
