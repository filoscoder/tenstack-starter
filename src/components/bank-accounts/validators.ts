import { checkSchema } from "express-validator";
import { bankCodes } from "@/config/bank-codes";

const verifyClabe = (clabe: string): boolean => {
  if (clabe.length !== 18) return false;
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  const truncated = clabe.substring(0, clabe.length - 1);
  const weighted = weights.map((w, i) => (w * Number(truncated[i])) % 10);
  const weightedSum = weighted.reduce((a, b) => a + b);
  const controlDigit = 10 - (weightedSum % 10);
  return truncated + controlDigit === clabe;
};

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
    bankId: {
      in: ["body"],
      notEmpty: true,
      isString: true,
      trim: true,
      custom: {
        options: (val) => bankCodes.includes(val) || val === "-1",
        errorMessage: "Invalid bank ID",
      },
      errorMessage: "Bank id is required",
    },
    bankNumber: {
      in: ["body"],
      notEmpty: true,
      isString: true,
      trim: true,
      custom: { options: verifyClabe, errorMessage: "Cuenta CLABE invalida" },
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
    bankId: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
      custom: {
        options: (val) => bankCodes.includes(val),
        errorMessage: "Invalid bank ID",
      },
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
