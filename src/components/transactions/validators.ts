import { checkSchema } from "express-validator";

export const validateCashoutRequest = () =>
  checkSchema({
    amount: {
      in: ["body"],
      isFloat: true,
      isEmpty: false,
      errorMessage: "amount is required",
    },
    bank_account: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      errorMessage: "bank_account (account id) is required",
    },
  });

export const validateDepositRequest = () =>
  checkSchema({
    id: {
      in: ["params"],
      optional: true,
    },
    tracking_number: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      errorMessage: "tracking_number is required",
    },
  });

export const validateDepositId = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      isNumeric: false,
      isEmpty: false,
    },
  });
