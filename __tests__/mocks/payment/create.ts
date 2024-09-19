import { CoinTransfer } from "@prisma/client";
import { CoinTransferServices } from "@/components/coin-transfers/services";
import { COIN_TRANSFER_STATUS } from "@/config";
import { PlayerServices } from "@/components/players/services";

const mockCoinTransferResult: CoinTransfer = {
  id: "foo",
  player_balance_after: 1,
  status: COIN_TRANSFER_STATUS.COMPLETED,
  created_at: new Date(),
  updated_at: new Date(),
};
export const mockAgentToPlayer = jest.fn(async () => mockCoinTransferResult);

export function prepareCashoutTest() {
  jest
    .spyOn(CoinTransferServices.prototype, "playerToAgent")
    .mockImplementation(mockAgentToPlayer);

  jest.spyOn(PlayerServices.prototype, "getBalance").mockResolvedValueOnce(0);
}
