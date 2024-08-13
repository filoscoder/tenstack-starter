import { Bonus, CoinTransfer } from "@prisma/client";

export type BonusRedemptionResult = {
  bonus: Bonus;
  coinTransfer: CoinTransfer;
};
