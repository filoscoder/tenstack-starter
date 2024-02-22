import { PrismaClient } from "@prisma/client";
import { UNAUTHORIZED } from "http-status";
import { checkSchema } from "express-validator";
import { apiResponse } from "@/helpers/apiResponse";

// TODO implement actual authentication
const prisma = new PrismaClient();

export const authenticatePlayer = async (
  req: AuthedReq,
  res: Res,
  next: NextFn,
) => {
  const player = await prisma.player.findFirst();
  if (!player)
    return res.status(UNAUTHORIZED).json(apiResponse(null, "No autorizado"));
  req.user = player;
  return next();
};

export const validateBankAccountIndex = () =>
  checkSchema({
    id: {
      in: ["params"],
      isNumeric: true,
      notEmpty: true,
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
      isNumeric: true,
      trim: true,
      errorMessage: "Owner id is required",
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
      trim: true,
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
      isNumeric: true,
      trim: true,
    },
  });
