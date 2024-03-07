import { NOT_FOUND } from "http-status";
import { Location, checkSchema } from "express-validator";
import { apiResponse } from "@/helpers/apiResponse";
import { PlayersDAO } from "@/db/players";

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
    password: {
      ...string,
      custom: { options: checkByteLength },
      errorMessage: "Contraseña demasiado larga",
    },
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

/**
 * bcrypt only accepts passwords of up to 72 bytes in length
 */
function checkByteLength(value: string): boolean {
  return new TextEncoder().encode(value).length <= 72;
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
