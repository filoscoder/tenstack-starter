import { PrismaClient } from "@prisma/client";
import { UNAUTHORIZED } from "http-status";
import { checkSchema } from "express-validator";
import { apiResponse } from "@/helpers/apiResponse";
import { BankAccountsDAO } from "@/db/bank-accounts";
import { ForbiddenError, NotFoundException } from "@/helpers/error";

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

/**
 * Ensure all required fields for creating bank account are present
 */
export const validateBankAccount = () =>
  checkSchema({
    name: {
      in: ["body"],
      notEmpty: true,
      errorMessage: "Name is required",
    },
    number: {
      in: ["body"],
      notEmpty: true,
      errorMessage: "Number is required",
    },
  });

export const validateAccountUpdate = () =>
  checkSchema({
    name: {
      in: ["body"],
      optional: true,
      notEmpty: true,
    },
    number: {
      in: ["body"],
      optional: true,
      notEmpty: true,
    },
    id: {
      in: ["params"],
      notEmpty: true,
      isNumeric: true,
      trim: true,
    },
  });

export const authorizeBankAccountUpdate = async (
  req: AuthedReq,
  _res: Res,
  next: NextFn,
) => {
  const account_id = req.params.id;
  const account = await BankAccountsDAO.show(Number(account_id));

  if (!account) return next(new NotFoundException());

  if (account.player_id !== req.user!.panel_id)
    return next(new ForbiddenError("No autorizado"));

  return next();
};

export const authorizeBankAccountDelete = authorizeBankAccountUpdate;
