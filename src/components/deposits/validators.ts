import { Deposit, Player } from "@prisma/client";
import { checkSchema } from "express-validator";
import { isKeyOfNestedObject } from "../players/validators";

export const isKeyOfDeposit = (key: string): key is keyof Deposit => {
  const mockDeposit: Deposit & { Player: Player } = {
    id: "",
    amount: 0,
    currency: "",
    dirty: false,
    player_id: "",
    status: "",
    tracking_number: "",
    Player: {
      id: "",
      panel_id: 0,
      username: "",
      password: "",
      email: "",
      first_name: "",
      last_name: "",
      date_of_birth: new Date(),
      movile_number: "",
      country: "",
      balance_currency: "",
      status: "",
      created_at: new Date(),
      updated_at: new Date(),
    },
    created_at: new Date(),
    updated_at: new Date(),
  };
  return isKeyOfNestedObject(mockDeposit, key);
};

export const validateDepositRequest = () =>
  checkSchema({
    id: {
      in: ["params"],
      optional: true,
    },
    tracking_number: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      errorMessage: "tracking_number is required",
    },
  });

export const validateDepositId = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      isNumeric: false,
      isEmpty: false,
    },
  });

export const validateDepositIndex = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      optional: true,
    },
  });

