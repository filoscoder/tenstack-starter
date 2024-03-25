import { checkSchema } from "express-validator";

export const validateCashoutRequest = () =>
  checkSchema({
    amount: {
      in: ["body"],
      isFloat: true,
      isEmpty: false,
      errorMessage: "amount is required",
    },
    currency: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      isLength: { options: { min: 3, max: 3 } },
      errorMessage: "currency must be a string of length 3",
    },
    bank_account: {
      in: ["body"],
      isEmpty: false,
      isInt: true,
      errorMessage: "bank_account (account id) is required",
    },
  });

export const validateDepositRequest = () =>
  checkSchema({
    id: {
      in: ["params"],
      optional: true,
    },
    currency: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      isLength: { options: { min: 3, max: 3 } },
      errorMessage: "currency must be a string of length 3",
    },
    tracking_number: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      errorMessage: "tracking_number is required",
    },
    paid_at: {
      in: ["body"],
      isEmpty: false,
      isISO8601: true,
      errorMessage:
        "paid_at must be a string in the format yyyy-mm-ddThh:mm:ss.sssZ",
    },
  });

export const validateDepositId = () =>
  checkSchema({
    id: {
      in: ["params"],
      isInt: true,
      isEmpty: false,
    },
  });
