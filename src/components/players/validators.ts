import { NOT_FOUND, BAD_REQUEST } from "http-status";
import { Request, Response } from "express";
import { apiResponse } from "@/helpers/apiResponse";

export const validatePlayerId = (req: Req, res: Res, next: NextFn) => {
  const { id } = req.params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    return res.status(NOT_FOUND).json(apiResponse(null, "Invalid player ID"));
  }

  return next();
};

export const validatePlayerDetails = (
  req: Request,
  res: Response,
  next: NextFn,
) => {
  const required = ["username", "password"];
  let message = "";
  for (const arg of required) {
    if (!req.body[arg]) message += `Falta argumento ${arg}. `;
  }

  if (message) res.status(BAD_REQUEST).json(apiResponse(null, message));

  return next();
};
