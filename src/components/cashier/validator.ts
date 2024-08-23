import { checkSchema, CustomValidator } from "express-validator";
import { CashierDAO } from "@/db/cashier";

const checkHandleNotInUse: CustomValidator = async (handle, { req }) => {
  const player = await CashierDAO.findFirst({ where: { handle } });
  if (player && player.id !== req.params!.id)
    throw new Error("Handle already in use");
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
