import { CustomValidator, checkSchema } from "express-validator";

const emptyBody: CustomValidator = (_value, { req }) => !req.body;
const noId: CustomValidator = (_value, { req }) => !req.params?.id;

export const validateTransferRequest = () =>
  checkSchema({
    id: {
      in: ["params"],
      exists: {
        if: emptyBody,
      },
    },
    amount: {
      exists: { if: noId },
      in: ["body"],
      isFloat: true,
      isEmpty: false,
      errorMessage: "amount is required",
    },
    currency: {
      exists: { if: noId },
      in: ["body"],
      isEmpty: false,
      isString: true,
      isLength: { options: { min: 3, max: 3 } },
      errorMessage: "currency is required",
    },
    bank_account: {
      exists: { if: noId },
      in: ["body"],
      isEmpty: false,
      isInt: true,
      errorMessage: "bank_account (account id) is required",
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
