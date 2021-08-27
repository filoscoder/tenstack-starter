import * as errors from '@/utils/error';

import { NextFunction, Request, Response } from 'express';

import HttpStatus from 'http-status';

/**
 * Error response middleware for 404 not found. This middleware function should be at the very bottom of the stack.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 */
export const notFoundError = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const NOT_FOUND_CODE = HttpStatus.NOT_FOUND;
  // eslint-disable-line no-unused-vars
  res.status(NOT_FOUND_CODE).json({
    error: {
      code: NOT_FOUND_CODE,
      message: HttpStatus[NOT_FOUND_CODE],
    },
  });
};

/**
 * Generic error response middleware for validation and internal server errors.
 *
 *
 * @param {*} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const genericErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // eslint-disable-line no-unused-vars
  if (err.stack) {
    process.stdout.write('Error stack trace: ', err.stack);
  }

  const error = errors.buildError(err);

  res.status(error.code).json({ error });
};
