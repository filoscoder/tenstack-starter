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

import { Bonus, CoinTransfer, Deposit, Payment } from "@prisma/client";

export type DepositResult = {
  // player_balance?: number;
  deposit: Deposit;
  coinTransfer?: CoinTransfer;
  bonus?: Bonus;
};

export type CashoutResult = {
  player_balance?: number;
  error?: string;
  payment: Payment;
};
