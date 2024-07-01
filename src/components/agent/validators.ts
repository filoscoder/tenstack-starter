import { Location, checkSchema } from "express-validator";
import CONFIG from "@/config";
import { PlayersDAO } from "@/db/players";

const ensurePlayerRole = async (id: string) => {
  const user = await PlayersDAO._getById(id);
  if (user?.roles.some((r) => r.name !== CONFIG.ROLES.PLAYER))
    throw new Error();
};

export const validateCredentials = () =>
  checkSchema({
    username: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
    password: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
  });

export const validatePaymentIndex = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      isEmpty: false,
    },
  });

export const validateBankAccountUpdate = () => {
  const optionalString: {
    in: Location[];
    isString: boolean;
    optional: boolean;
    trim: boolean;
    isEmpty: boolean;
  } = {
    in: ["body"],
    isString: true,
    optional: true,
    trim: true,
    isEmpty: false,
  };
  return checkSchema({
    name: optionalString,
    dni: optionalString,
    bankName: optionalString,
    accountNumber: optionalString,
    clabe: optionalString,
    alias: optionalString,
  });
};

export const validateOnCallRequest = () =>
  checkSchema({
    active: {
      in: ["body"],
      isBoolean: true,
      optional: false,
    },
  });

export const validateSupportRequest = () =>
  checkSchema({
    bot_phone: {
      in: ["body"],
      isString: true,
      optional: true,
      trim: true,
      custom: {
        options: (value: string) =>
          value.length > 0 ? value.length > 10 && !isNaN(Number(value)) : true,
      },
      errorMessage:
        "bot_phone must be a numeric string between 10 and 20 characters long",
      isLength: {
        options: { max: 20 },
      },
    },
    human_phone: {
      in: ["body"],
      isString: true,
      optional: true,
      custom: {
        options: (value: string) =>
          value.length > 0 ? value.length > 10 && !isNaN(Number(value)) : true,
      },
      trim: true,
      errorMessage:
        "human_phone must be a numeric string between 10 and 20 characters long",
      isLength: {
        options: { max: 20 },
      },
    },
  });

export const validateResetPasswordRequest = () =>
  checkSchema({
    new_password: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      isByteLength: {
        options: { max: 72 },
        errorMessage: "password must be under 73 characters",
      },
      isLength: {
        options: { min: 4 },
        errorMessage: "password must be at least 4 characters long",
      },
      errorMessage: "new_password is required",
    },
    user_id: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: ensurePlayerRole,
        errorMessage: "only player passwords can be updated",
      },
      errorMessage: "user_id is required",
    },
  });
