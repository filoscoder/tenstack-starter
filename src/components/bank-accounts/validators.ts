import { checkSchema } from "express-validator";

export const validateBankAccountIndex = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      optional: true,
    },
  });

/**
 * Ensure all required fields for creating bank account are present
 */
export const validateBankAccount = () =>
  checkSchema({
    owner: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      errorMessage: "Owner name is required",
    },
    owner_id: {
      in: ["body"],
      notEmpty: true,
      custom: {
        // 4294967295: max value of UNSIGNED INT in mariadb
        options: (value) => typeof value === "number" && value < 4294967295,
      },
      customSanitizer: { options: (value) => Number(value) },
      errorMessage: "owner_id must be an integer lower than 2**32",
    },
    bankName: {
      in: ["body"],
      notEmpty: true,
      isString: true,
      trim: true,
      errorMessage: "Bank name is required",
    },
    bankNumber: {
      in: ["body"],
      notEmpty: true,
      isString: true,
      trim: true,
      errorMessage: "Bank number is required",
    },
    bankAlias: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
    },
  });

export const validateAccountUpdate = () =>
  checkSchema({
    owner: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
    },
    owner_id: {
      in: ["body"],
      optional: true,
      isNumeric: true,
    },
    bankName: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
    },
    bankNumber: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
    },
    bankAlias: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
    },
    id: {
      in: ["params"],
      notEmpty: true,
      isString: true,
    },
  });
