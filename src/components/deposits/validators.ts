import { Deposit, Player } from "@prisma/client";
import { checkSchema } from "express-validator";
import { isKeyOfNestedObject } from "../players/validators";
import { bankCodes } from "@/config/bank-codes";
import CONFIG from "@/config";

export const isKeyOfDeposit = (key: string): key is keyof Deposit => {
  const mockDeposit: Deposit & { Player: Player } = {
    id: "",
    amount: 0,
    currency: "",
    dirty: false,
    player_id: "",
    status: "",
    tracking_number: "",
    date: new Date(),
    sending_bank: "",
    cep_ok: false,
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
    amount: {
      in: ["body"],
      isEmpty: false,
      isNumeric: true,
      custom: { options: (val) => !isNaN(Number(val)) },
      customSanitizer: { options: (val) => Number(val) },
      errorMessage: "invalid amount",
    },
    date: {
      in: ["body"],
      isEmpty: false,
      isISO8601: true,
      errorMessage: "invalid date",
    },
    sending_bank: {
      in: ["body"],
      isEmpty: false,
      isNumeric: true,
      trim: true,
      custom: {
        options: (val) => bankCodes.includes(val),
        errorMessage: "invalid sending_bank",
      },
      errorMessage: "sending_bank is required",
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

export const validateDepositUpdateRequest = () =>
  checkSchema({
    status: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      trim: true,
      isIn: {
        options: [Object.values(CONFIG.SD.DEPOSIT_STATUS)],
        errorMessage: "invalid status",
      },
      errorMessage: "status is required",
    },
  });
