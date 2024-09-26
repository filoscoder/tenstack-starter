import { Bonus, PrismaPromise } from "@prisma/client";
import { BONUS_STATUS } from "@/config";
import { BonusDAO } from "@/db/bonus";

export const mockBonus: Bonus = {
  id: "spam",
  player_id: "baz",
  amount: 0,
  percentage: 100,
  status: BONUS_STATUS.ASSIGNED,
  coin_transfer_id: "eggs",
  dirty: false,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockFindMany = jest.fn(async () => [
  mockBonus,
]) as () => PrismaPromise<Bonus[]>;

export function preparePlayerBonusTest() {
  jest.spyOn(BonusDAO, "findMany").mockImplementation(mockFindMany);
}
