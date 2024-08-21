import { checkSchema } from "express-validator";

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
