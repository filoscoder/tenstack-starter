import { NOT_FOUND, UNAUTHORIZED } from "http-status";
import { Location, checkSchema } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { apiResponse } from "@/helpers/apiResponse";
import { PlayersDAO } from "@/db/players";

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

export const validatePlayerRequest = () => {
  const string: {
    in: Location[];
    isString: boolean;
    isEmpty: boolean;
    trim: boolean;
  } = {
    in: ["body"],
    isString: true,
    isEmpty: false,
    trim: true,
  };
  return checkSchema({
    username: string,
    password: string,
    email: {
      in: ["body"],
      isEmail: true,
      isEmpty: false,
      trim: true,
      custom: { options: checkEmailNotInUse },
    },
    first_name: { ...string, optional: true },
    last_name: { ...string, optional: true },
    date_of_birth: { ...string, optional: true, isDate: true },
    movile_number: { ...string, optional: true },
    country: { ...string, optional: true },
  });
};

async function checkEmailNotInUse(value: string): Promise<void> {
  const player = await PlayersDAO.getByEmail(value);
  if (player) throw new Error("Usuario con ese email ya existe");
}

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
