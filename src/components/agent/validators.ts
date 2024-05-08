import { Location, checkSchema } from "express-validator";

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

export const validateDepositIndex = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      optional: true,
    },
  });

export const validateDepositUpdate = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      isEmpty: false,
      optional: false,
    },
    tracking_number: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      optional: false,
    },
  });

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
