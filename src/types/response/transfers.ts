// export type CoinTransferRequest = {
//   panel_id: number;
//   amount: number;
//   currency: string;
// };

export type CoinTransferResult = {
  ok: boolean;
  player_balance?: number;
  error?: string;
};

import { CoinTransfer, Deposit, Payment } from "@prisma/client";

export type DepositResult = {
  // player_balance?: number;
  coinTransfer?: CoinTransfer;
  deposit: Deposit;
};

export type CashoutResult = {
  player_balance?: number;
  error?: string;
  payment: Payment;
};
