import { NextFunction, Request, Response } from "express";

import HttpStatus, {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  REQUEST_TIMEOUT,
} from "http-status/lib";
import { TimeOutError } from "@/helpers/error";

/**
 * @description Error response middleware for 404 not found. This middleware function should be at the very bottom of the stack.
 * @param req Express.Request
 * @param res Express.Response
 * @param _next Express.NextFunction
 */
export const notFoundError = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(NOT_FOUND).json({
    error: {
      code: NOT_FOUND,
      message: HttpStatus[NOT_FOUND],
      path: req.originalUrl,
    },
  });
};

/**
 * @description Generic error response middleware for validation and internal server errors.
 * @param {*} err
 * @param {object}   req Express.Request
 * @param {object}   res Express.Response
 * @param {function} next Express.NextFunction
 */
export const genericErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let resCode: number = err.status || INTERNAL_SERVER_ERROR;
  let resBody = err;

  if (err.code === "ETIMEDOUT") {
    resCode = REQUEST_TIMEOUT;
    resBody = new TimeOutError(req.originalUrl);
  }
  // console.log("[genericErrorHandler]", resBody);

  res.status(resCode).json(resBody);
};

export const customErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    res.status(err.status).json({
      code: err.code,
      description: err.description,
    });
  } else {
    return next(err);
  }
};

export class CustomError extends Error {
  status: number;
  code: string;
  description: string;

  constructor(err: ErrorData) {
    super(err.description);

    this.description = err.description;
    this.code = err.code;
    this.status = err.status;
  }
}

export interface ErrorData {
  status: number; // 400
  code: string; // bad_request
  description: string; // Missing parameter x
}

export const ERR: { [key: string]: ErrorData } = {
  USER_ALREADY_EXISTS: {
    status: 400,
    code: "ya_existe",
    description: "Un usuario con ese nombre ya existe",
  },
  INVALID_CREDENTIALS: {
    status: 404,
    code: "credenciales_invalidas",
    description: "Usuario o contraseña incorrectos",
  },
};
