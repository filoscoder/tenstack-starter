import { CoinTransfer } from "@prisma/client";
import CONFIG from "@/config";
import { CoinTransferDAO } from "@/db/coin-transfer";
import { CasinoCoinsService } from "@/services/casino-coins.service";

export class CoinTransferServices {
  /**
   * Release all pending transfers that might have accumulated due to players
   * requesting more coins than the agent has on balance.
   */
  async releasePending(): Promise<CoinTransfer[]> {
    // TODO
    // Check
    const casinoCoinServices = new CasinoCoinsService();
    const pendingTransfers = await CoinTransferDAO.findMany({
      status: CONFIG.SD.COIN_TRANSFER_STATUS.PENDING,
      AND: {
        OR: [
          { Deposit: { status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED } },
          { Bonus: { status: CONFIG.SD.BONUS_STATUS.REQUESTED } },
        ],
      },
    });
    const result: CoinTransfer[] = [];
    for (const transfer of pendingTransfers) {
      result.push(await casinoCoinServices.agentToPlayer(transfer.id));
    }
    return result;
    // const deposits = await DepositsDAO.getPendingCoinTransfers();
    // const response: Deposit[] = [];
    // const depositServices = new DepositServices();
    // for (const deposit of deposits) {
    //   if (deposit.status !== CONFIG.SD.DEPOSIT_STATUS.VERIFIED) continue;
    //   const result = await depositServices.finalizeDeposit(deposit);
    //   response.push(result.deposit);
    // }

    // return response;
  }
}
