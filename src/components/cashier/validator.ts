import { checkSchema, CustomValidator } from "express-validator";
import { CashierDAO } from "@/db/cashier";

const checkHandleNotInUse: CustomValidator = async (handle, { req }) => {
  const player = await CashierDAO.findFirst({ where: { handle } });
  if (player && player.id !== req.params!.id)
    throw new Error("Handle already in use");
};

const isValidCasinoDate: CustomValidator = (value: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}-\d{2}:\d{2}$/;
  return regex.test(value);
};

export const validateCashierId = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      errorMessage: "Cashier id must be a string",
    },
  });

export const validatePlayerId = () =>
  checkSchema({
    player_id: {
      in: ["params"],
      isString: true,
      errorMessage: "Player id must be a string",
    },
  });

export const validateHandleUpdateRequest = () =>
  checkSchema({
    handle: {
      in: ["body"],
      isString: true,
      optional: true,
      trim: true,
      custom: {
        options: checkHandleNotInUse,
        errorMessage: "Ese alias ya está en uso",
      },
    },
  });

export const validateGeneralReportRequest = () =>
  checkSchema({
    date_from: {
      in: ["query"],
      custom: {
        options: isValidCasinoDate,
        errorMessage: "Formato inválido en date_from",
      },
      trim: true,
      errorMessage: "date_from is required",
    },
    date_to: {
      in: ["query"],
      custom: {
        options: isValidCasinoDate,
        errorMessage: "Formato inválido en date_to",
      },
      trim: true,
      errorMessage: "date_to is required",
    },
  });
