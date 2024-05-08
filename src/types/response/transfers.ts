export type CoinTransferResult = {
  ok: boolean;
  player_balance?: number;
  error?: string;
};

import { Deposit, Payment } from "@prisma/client";

export type DepositResult = {
  player_balance?: number;
  error?: string;
  deposit: Deposit;
};

export type CashoutResult = {
  player_balance?: number;
  error?: string;
  payment: Payment;
};
