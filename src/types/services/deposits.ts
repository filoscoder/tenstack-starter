import { Deposit, Player, Bonus } from "@prisma/client";

export type FullDeposit = Deposit & {
  Player: Player & { Bonus: Bonus | null };
  CoinTransfer?: { status: string };
};
