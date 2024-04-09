export type CoinTransferResult = {
  ok: boolean;
  player_balance?: number;
  error?: string;
};

import { Deposit } from "@prisma/client";

export type DepositResult = {
  player_balance?: number;
  error?: string;
  deposit: Deposit;
};
