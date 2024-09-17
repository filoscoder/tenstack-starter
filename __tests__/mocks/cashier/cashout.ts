import { CashierServices } from "@/components/cashier/services";
import { CoinTransferServices } from "@/components/coin-transfers/services";
import { CoinTransferResult } from "@/types/response/transfers";

export function prepareCashierCashoutTest() {
  const mockCoinTransferResult: CoinTransferResult = {
    ok: true,
    player_balance: 10,
  };
  jest
    .spyOn((CoinTransferServices as any).prototype, "transfer")
    .mockResolvedValue(mockCoinTransferResult);
  jest
    .spyOn(CashierServices.prototype, "showBalance")
    .mockResolvedValueOnce(10);
}
