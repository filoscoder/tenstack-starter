import { NextFunction, Request, Response } from "express";
import {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  REQUEST_TIMEOUT,
  UNAUTHORIZED,
} from "http-status/lib";
import { Prisma } from "@prisma/client";
import CONFIG from "@/config";
import { logtailLogger } from "@/helpers/loggers";
import { apiResponse } from "@/helpers/apiResponse";
import { parsePrismaError } from "@/utils/parser";
import { UnauthorizedError } from "@/helpers/error";
import { CustomError } from "@/helpers/error/CustomError";

/**
 * @description Error response middleware for not found urls. This middleware function should be at the very bottom of the stack.
 * @param req Express.Request
 * @param res Express.Response
 * @param _next Express.NextFunction
 */
export const notFoundError = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(NOT_FOUND).json(
    apiResponse(
      null,
      new CustomError({
        status: NOT_FOUND,
        code: "url_not_found",
        description: `Path: ${req.originalUrl}`,
      }),
    ),
  );
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
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const resCode: number = err.status || INTERNAL_SERVER_ERROR;

  res
    .status(resCode)
    .json(
      apiResponse(
        null,
        new CustomError({ status: resCode, code: "error", description: err }),
      ),
    );

  if (CONFIG.APP.ENV === "production")
    logtailLogger.error({
      status: resCode,
      code: "uncaught_error",
      description: err ?? "Internal server error",
    });

  if (CONFIG.LOG.LEVEL === "debug") console.error(err);
};

export const requestTimeoutHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.code === "ETIMEDOUT") {
    res.status(REQUEST_TIMEOUT).json(
      apiResponse(
        null,
        new CustomError({
          status: REQUEST_TIMEOUT,
          code: "request_timeout",
          description: "",
        }),
      ),
    );
  } else return next(err);
};

export const customErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    res.status(err.status).json(apiResponse(null, err));
    if (
      // @ts-ignore
      CONFIG.LOG.CODES.includes(err.code) &&
      CONFIG.APP.ENV === "production"
    ) {
      logtailLogger.error({ err });
    }
    if (CONFIG.LOG.LEVEL === "debug") {
      console.error(err);
    }
  } else {
    return next(err);
  }
};

export function prismaErrorHandler(
  err:
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientValidationError,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    const parsed = parsePrismaError(err);
    res.status(parsed.status).send(apiResponse(null, parsed));
    if (CONFIG.LOG.LEVEL === "debug") console.error(err);
    if (CONFIG.APP.ENV === "production") logtailLogger.error({ err: parsed });
  } else return next(err);
}

export function authenticationErrorHandler(
  err: any,
  _req: Req,
  res: Res,
  next: NextFunction,
) {
  if (err.name === "AuthenticationError")
    res.status(UNAUTHORIZED).json(apiResponse(null, new UnauthorizedError("")));
  else next(err);
}
