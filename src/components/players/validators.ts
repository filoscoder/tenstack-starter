import { NOT_FOUND } from "http-status";
import {
  CustomValidator,
  Location,
  body,
  checkSchema,
} from "express-validator";
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

const isDate: CustomValidator = (value: string, { req }) => {
  if (value.length === 0) return true;
  return body("date_of_birth").isISO8601().run(req);
};

export const validatePlayerRequest = () => {
  const optionalString: {
    in: Location[];
    isString: boolean;
    trim: boolean;
    optional: boolean;
    isEmpty: boolean;
  } = {
    in: ["body"],
    isString: true,
    optional: true,
    trim: true,
    isEmpty: false,
  };
  return checkSchema({
    username: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
      errorMessage: "username is required",
    },
    password: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
      custom: {
        options: checkByteLength,
        errorMessage: "password must be under 73 characters",
      },
      errorMessage: "password is required",
    },
    email: {
      in: ["body"],
      isEmail: true,
      isEmpty: false,
      trim: true,
      custom: { options: checkEmailNotInUse },
      errorMessage: "email is required",
    },
    first_name: optionalString,
    last_name: optionalString,
    date_of_birth: {
      in: ["body"],
      optional: true,
      custom: { options: isDate },
      customSanitizer: {
        options: (value: string) => {
          if (value.length === 0) return null;
          return value;
        },
      },
    },
    movile_number: optionalString,
    country: optionalString,
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
