import { Deposit, Player } from "@prisma/client";
import { checkSchema } from "express-validator";
import { isKeyOfNestedObject } from "../players/validators";
import { bankCodes } from "@/config/bank-codes";
import { DEPOSIT_STATUS } from "@/config";
import { mockPlayer } from "@/config/mockPlayer";

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
    coin_transfer_id: "",
    Player: mockPlayer,
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
      custom: {
        options: (val) => !isNaN(Number(val)),
        errorMessage: "amount debe ser un numero",
      },
      customSanitizer: { options: (val) => Number(val) },
      errorMessage: "invalid amount",
    },
    date: {
      in: ["body"],
      isEmpty: false,
      isISO8601: true,
      customSanitizer: { options: (val) => new Date(val).toISOString() },
      errorMessage: "invalid date",
    },
    sending_bank: {
      in: ["body"],
      isEmpty: false,
      isNumeric: true,
      trim: true,
      custom: {
        options: (val) => bankCodes.includes(val) || val === "-1",
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

export const validateDepositSetStatusRequest = () =>
  checkSchema({
    status: {
      in: ["body"],
      optional: true,
      isString: true,
      trim: true,
      custom: {
        options: (val) => Object.values(Object(DEPOSIT_STATUS)).includes(val),
        errorMessage: "invalid status",
      },
      errorMessage: "status is required",
    },
  });
