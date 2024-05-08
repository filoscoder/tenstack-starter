import { checkSchema } from "express-validator";

export const validateCashoutRequest = () =>
  checkSchema({
    amount: {
      in: ["body"],
      isFloat: true,
      isEmpty: false,
      errorMessage: "amount is required",
      custom: {
        options: (value) => value > 0 && value < 2 ** 32,
        errorMessage: "amount must be a number between 0 and 2**32",
      },
    },
    bank_account: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      errorMessage: "bank_account (account id) is required",
    },
  });
