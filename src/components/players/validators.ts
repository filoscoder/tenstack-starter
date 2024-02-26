import { NOT_FOUND, UNAUTHORIZED } from "http-status";
import { checkSchema } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { apiResponse } from "@/helpers/apiResponse";

// TODO implement actual authentication
const prisma = new PrismaClient();

export const authenticatePlayer = async (
  req: AuthedReq,
  res: Res,
  next: NextFn,
) => {
  const player = await prisma.player.findFirst();
  if (!player)
    return res.status(UNAUTHORIZED).json(apiResponse(null, "No autorizado"));
  req.player = player;
  return next();
};

export const validatePlayerId = (req: Req, res: Res, next: NextFn) => {
  const { id } = req.params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    return res.status(NOT_FOUND).json(apiResponse(null, "Invalid player ID"));
  }

  return next();
};

export const validatePlayerRequest = () =>
  checkSchema({
    username: {
      in: ["body"],
      isString: true,
      isEmpty: false,
    },
    password: {
      in: ["body"],
      isString: true,
      isEmpty: false,
    },
    email: {
      in: ["body"],
      isEmail: true,
      isEmpty: false,
    },
  });

export const validateCredentials = () =>
  checkSchema({
    username: {
      in: ["body"],
      isString: true,
      isEmpty: false,
    },
    password: {
      in: ["body"],
      isString: true,
      isEmpty: false,
    },
  });
