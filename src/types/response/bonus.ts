import { Bonus } from "@prisma/client";

export type BonusRedemptionResult = {
  player_balance?: number;
  error?: string;
  bonus: Bonus;
};
