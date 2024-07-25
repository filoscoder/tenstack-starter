import {
  CustomValidator,
  Location,
  body,
  checkSchema,
} from "express-validator";
import { Player } from "@prisma/client";
import { PlayersDAO } from "@/db/players";
import { PLAYER_STATUS } from "@/config";

const isDate: CustomValidator = (value: string, { req }) => {
  if (value.length === 0) return true;
  return body("date_of_birth").isISO8601().run(req);
};

export const isKeyOfNestedObject = (
  nestedObject: { [key: string]: any },
  key: string,
) => {
  const keys = key.split(".");
  let current = nestedObject;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return false;
    }
  }

  return true;
};

export const isKeyOfPlayer = (key: string): key is keyof Player => {
  const mockPlayer: Player = {
    id: "",
    panel_id: 0,
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    date_of_birth: new Date(),
    movile_number: "",
    country: "",
    balance_currency: "",
    status: "",
    created_at: new Date(),
    updated_at: new Date(),
  };
  return isKeyOfNestedObject(mockPlayer, key);
};

const isSortDirection = (key: string): key is "asc" | "desc" => {
  return key === "asc" || key === "desc";
};

const isPlayerStatus = (
  value: string,
): value is PLAYER_STATUS.ACTIVE | PLAYER_STATUS.BANNED => {
  return value === PLAYER_STATUS.ACTIVE || value === PLAYER_STATUS.BANNED;
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
      isLength: {
        options: { min: 4 },
        errorMessage: "password must be at least 4 characters long",
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
    movile_number: {
      in: ["body"],
      isString: true,
      isNumeric: true,
      optional: true,
      trim: true,
      isEmpty: false,
      isLength: {
        options: { max: 20 },
        errorMessage: "movile_number is too long",
      },
      errorMessage: "movile_number must be a numeric string",
    },
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
export function checkByteLength(value: string): boolean {
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

export const validateResourceSearchRequest = (isKeyOf: KeyIsKeyOfTValidator) =>
  checkSchema({
    page: {
      in: ["query"],
      default: { options: 1 },
      isInt: {
        options: { min: 1, max: 2 ** 32 },
        errorMessage: "page must be greater than 0",
      },
      toInt: true,
    },
    items_per_page: {
      in: ["query"],
      default: { options: 20 },
      customSanitizer: { options: (value) => (value <= 0 ? 20 : value) },
      isInt: {
        options: { min: 1, max: 2 ** 32 },
        errorMessage: "items_per_page must be greater than 0",
      },
      toInt: true,
    },
    search: {
      in: ["query"],
      isString: true,
      optional: true,
      trim: true,
    },
    sort_column: {
      in: ["query"],
      isString: true,
      optional: true,
      trim: true,
      custom: { options: isKeyOf, errorMessage: "Invalid sort_column" },
    },
    sort_direction: {
      in: ["query"],
      isString: true,
      optional: true,
      trim: true,
      custom: {
        options: isSortDirection,
        errorMessage: "sort_direction must be 'asc' or 'desc'",
      },
    },
  });

export const validatePlayerUpdateRequest = () =>
  checkSchema({
    email: {
      in: ["body"],
      isEmail: true,
      optional: true,
      isEmpty: false,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const player = await PlayersDAO.getByEmail(value);
          if (player && player.id !== req.params!.id)
            throw new Error("Email already in use");
        },
        errorMessage: "Ese email ya está en uso",
      },
    },
    movile_number: {
      in: ["body"],
      isString: true,
      isNumeric: true,
      optional: true,
      trim: true,
      isEmpty: false,
      isLength: {
        options: { max: 20 },
        errorMessage: "movile_number is too long",
      },
      errorMessage: "movile_number must be a numeric string",
    },
    first_name: {
      in: ["body"],
      isString: true,
      optional: true,
      trim: true,
      isEmpty: false,
    },
    last_name: {
      in: ["body"],
      isString: true,
      optional: true,
      trim: true,
      isEmpty: false,
    },
    status: {
      in: ["body"],
      isString: true,
      optional: true,
      trim: true,
      isEmpty: false,
      custom: {
        options: isPlayerStatus,
        errorMessage: "invalid status",
      },
    },
  });

export type KeyIsKeyOfTValidator = {
  (key: string): boolean;
};
