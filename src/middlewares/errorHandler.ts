import { NextFunction, Request, Response } from "express";

import HttpStatus, {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  REQUEST_TIMEOUT,
} from "http-status/lib";
import { Prisma } from "@prisma/client";
import { TimeOutError } from "@/helpers/error";
import { ErrorData } from "@/types/response/error";
import CONFIG from "@/config";

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
  // Handle Prisma errors
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    prismaErrorHandler(err, res);
  }
  let resCode: number = err.status || INTERNAL_SERVER_ERROR;
  let resBody = err;

  if (err.code === "ETIMEDOUT") {
    resCode = REQUEST_TIMEOUT;
    resBody = new TimeOutError(req.originalUrl);
  }

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

function prismaErrorHandler(
  err:
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientValidationError,
  res: Res,
) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let status, code, description;
    switch (err.code) {
      case "P2025":
        status = 404;
        code = "not_found";
        description = "No se encontro el recurso";
        break;
      case "P2002":
        const key = err.message.split("\n").at(-1)?.split("`")[1];
        status = 409;
        code = "unique_constraint";
        description = `Una entrada con ese ${key} ya existe. Error: `;
        break;
      case "P2003":
        status = 409;
        code = "dependencias_pendientes";
        description = "No se puede eliminar, otras entidades dependen de esta";
        break;
      case "P2005":
        status = 400;
        code = "restringido";
        description =
          "Una restricion fallo en la BD: " + err.meta?.["database_error"];
        break;
      case "P2006":
        status = 400;
        code = "valor_invalido";
        description = `El valor provisto ${err.meta?.["field_value"]} para el campo ${err.meta?.["field_name"]} del ${err.meta?.["model_name"]} no es válido`;
        break;
      case "P2011":
        status = 400;
        code = "null_constraint";
        description = `Violacion de null_constraint en ${err.meta?.constraint}`;
        break;
      case "P2014":
        status = 400;
        code = "restringido";
        description = `El cambio que estas intentando hacer violaria la relacion ${err.meta?.["relation_name"]} entre los modelos ${err.meta?.["model_a_name"]} y ${err.meta?.["model_b_name"]}`;
        break;
      case "P2019":
        status = 400;
        code = "input_error";
        description = `Input error: ${err.meta?.details}`;
        break;
      case "P2020":
        status = 400;
        code = "fuera_de_rango";
        description = `Valor fuera de rango. ${err.meta?.details}`;
        break;
      default:
        res.status(500).json({
          code: "error_bbdd",
          description: `Error en la base de datos: ${err.message}`,
        });
    }
    res.status(status || 400).send({ status, code, description });
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    let description = "Error de validacion de datos ";
    if (CONFIG.APP.ENV?.includes("test") || CONFIG.APP.ENV?.includes("dev")) {
      description += err.message;
    } else {
      description += err.message.split("Unknown")[1];
    }
    res.status(400).send({
      status: 400,
      code: "error_validacion",
      description,
    });
  }
}
