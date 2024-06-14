import { BankAccount, Payment, Player } from "@prisma/client";
import { checkSchema } from "express-validator";
import { isKeyOfNestedObject } from "../players/validators";

export const isKeyOfPayment = (key: string): key is keyof Payment => {
  const mockPayment: Payment & { Player: Player; BankAccount: BankAccount } = {
    id: "",
    amount: 0,
    bank_account: "",
    currency: "",
    dirty: false,
    player_id: "",
    status: "",
    alquimia_id: 0,
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
    BankAccount: {
      id: "",
      player_id: "",
      owner: "",
      bankAlias: "",
      bankName: "",
      bankNumber: "",
      created_at: new Date(),
      updated_at: new Date(),
    },
    created_at: new Date(),
    updated_at: new Date(),
  };
  return isKeyOfNestedObject(mockPayment, key);
};

export const validateCashoutRequest = () =>
  checkSchema({
    amount: {
      in: ["body"],
      isFloat: true,
      isEmpty: false,
      errorMessage: "amount is required",
      custom: {
        options: (value) => value > 0 && value < 2 ** 32,
        errorMessage: "amount must be a number between 0 and 2**32",
      },
    },
    bank_account: {
      in: ["body"],
      isEmpty: false,
      isString: true,
      errorMessage: "bank_account (account id) is required",
    },
  });
