import { checkSchema } from "express-validator";

export const validateTransferRequest = () =>
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
      errorMessage: "currency is required",
    },
    bank_account: {
      in: ["body"],
      isEmpty: false,
      isInt: true,
      errorMessage: "bank_account (account id) is required",
    },
  });
