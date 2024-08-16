import { CoinTransfer } from "@prisma/client";
import CONFIG, {
  BONUS_STATUS,
  COIN_TRANSFER_STATUS,
  DEPOSIT_STATUS,
} from "@/config";
import { CoinTransferDAO } from "@/db/coin-transfer";
import { ERR } from "@/config/errors";
import { UserRootDAO } from "@/db/user-root";
import { NotFoundException } from "@/helpers/error";
import { AgentApiError } from "@/helpers/error/AgentApiError";
import { CustomError } from "@/helpers/error/CustomError";
import { logtailLogger } from "@/helpers/loggers";
import { WebPush } from "@/notification/web-push";
import { HttpService } from "@/services/http.service";
import { TransferDetails } from "@/types/request/transfers";
import { CoinTransferResult } from "@/types/response/transfers";
import { parseTransferResult } from "@/utils/parser";
import { useTransaction } from "@/helpers/useTransaction";

export class CoinTransferServices {
  /**
   * Transfer coins from player to agent (Cashout)
   *
   * @throws {CustomError} INSUFICIENT_BALANCE | COIN_TRANSFER_UNSUCCESSFUL
   */
  async playerToAgent(
    coin_transfer_id: string,
    tx: PrismaTransactionClient,
  ): Promise<CoinTransfer> {
    const coinTransfer = await tx.coinTransfer.findFirst({
      where: { id: coin_transfer_id },
      include: {
        Payment: { include: { Player: { include: { roles: true } } } },
      },
    });
    if (!coinTransfer) throw new NotFoundException("CoinTransfer not found");

    const transferDetails = await this.generateTransferDetails(
      "cashout",
      coinTransfer.Payment!.Player.panel_id,
      coinTransfer.Payment!.amount,
      coinTransfer.Payment!.Player.balance_currency,
    );

    await tx.coinTransfer.update({
      where: { id: coinTransfer.id },
      data: {
        status: COIN_TRANSFER_STATUS.COMPLETED,
      },
    });

    const coinTransferResult = await this.transfer(transferDetails);
    this.handleTransferError(coinTransferResult);

    return await tx.coinTransfer.update({
      where: { id: coinTransfer.id },
      data: {
        player_balance_after: coinTransferResult.player_balance,
      },
    });
  }

  /**
   * Transfer coins from agent to player
   *
   * @throws {CustomError} INSUFICIENT_BALANCE | COIN_TRANSFER_UNSUCCESSFUL
   */
  async agentToPlayer(
    coin_transfer_id: string,
    tx: PrismaTransactionClient,
  ): Promise<CoinTransfer> {
    const coinTransfer = await tx.coinTransfer.findFirst({
      where: { id: coin_transfer_id },
      include: {
        Deposit: { include: { Player: { include: { roles: true } } } },
        Bonus: { include: { Player: { include: { roles: true } } } },
      },
    });
    if (!coinTransfer) throw new NotFoundException("CoinTransfer not found");

    const parent = coinTransfer.Bonus || coinTransfer.Deposit;
    const transferDetails = await this.generateTransferDetails(
      "deposit",
      parent!.Player.panel_id,
      parent!.amount,
      parent!.Player.balance_currency,
    );

    await tx.coinTransfer.update({
      where: { id: coinTransfer.id },
      data: {
        status: COIN_TRANSFER_STATUS.COMPLETED,
      },
    });

    const coinTransferResult = await this.transfer(transferDetails);
    this.handleTransferError(coinTransferResult);

    return await tx.coinTransfer.update({
      where: { id: coinTransfer.id },
      data: {
        player_balance_after: coinTransferResult.player_balance,
      },
    });
  }

  /**
   * Send coins
   */
  private async transfer(
    transferDetails: TransferDetails,
  ): Promise<CoinTransferResult> {
    const { authedAgentApi } = new HttpService();
    const url = "/backoffice/transactions/";
    const result = await authedAgentApi.post<any>(url, transferDetails);

    if (
      result.data.code == "insuficient_balance" &&
      transferDetails.type === "deposit"
    )
      await this.notifyInsuficientBalance(
        transferDetails.amount,
        result.data.variables.balance_amount,
      );

    if (result.status !== 201 && result.status !== 400) {
      if (CONFIG.LOG.LEVEL === "debug") console.log(result.data);
      const errMsg = "Error en el panel al transferir fichas";
      const err = new AgentApiError(result.status, errMsg, result.data);
      logtailLogger.error({ err });
      return { ok: false, error: errMsg };
    }
    return parseTransferResult(result, transferDetails.type);
  }

  private async generateTransferDetails(
    type: "deposit" | "cashout",
    playerPanelId: number,
    amount: number,
    currency: string,
  ): Promise<TransferDetails> {
    const agent = await UserRootDAO.getAgent();

    let recipient_id, sender_id;

    switch (type) {
      case "deposit":
        recipient_id = playerPanelId;
        sender_id = agent!.panel_id;
        break;
      case "cashout":
        recipient_id = agent!.panel_id;
        sender_id = playerPanelId;
        break;
    }

    return {
      recipient_id,
      sender_id,
      amount: amount,
      currency: currency,
      type,
    };
  }

  private notifyInsuficientBalance(
    transferAmount: number,
    currentBalance: number,
  ): Promise<void> {
    const difference = transferAmount - currentBalance;
    return WebPush.agent({
      title: "Fichas insuficientes",
      body: `Necesitas recargar ${difference} fichas para completar transferencias pendientes.`,
      tag: CONFIG.SD.INSUFICIENT_CREDITS,
    });
  }

  /**
   * Release all pending transfers that might have accumulated due to players
   * requesting more coins than the agent has on balance.
   */
  async releasePending(): Promise<CoinTransfer[]> {
    // TODO
    // Check
    const pendingTransfers = await CoinTransferDAO.findMany({
      where: {
        status: COIN_TRANSFER_STATUS.PENDING,
        AND: {
          OR: [
            { Deposit: { status: DEPOSIT_STATUS.VERIFIED } },
            { Bonus: { status: BONUS_STATUS.REQUESTED } },
          ],
        },
      },
    });
    const result: CoinTransfer[] = [];
    for (const transfer of pendingTransfers) {
      const coinTransfer = await useTransaction<CoinTransfer>((tx) =>
        this.agentToPlayer(transfer.id, tx),
      );
      coinTransfer && result.push(coinTransfer);
    }
    return result;
  }

  /**
   * Get the sum of amounts of pending transfers (where deposit is VERIFIED or
   * bonus is REQUESTED)
   */
  async getPendingTotal(): Promise<number> {
    const pendingTransfers = await CoinTransferDAO.findMany({
      where: {
        status: COIN_TRANSFER_STATUS.PENDING,
        AND: {
          OR: [
            { Deposit: { status: DEPOSIT_STATUS.VERIFIED } },
            { Bonus: { status: BONUS_STATUS.REQUESTED } },
          ],
        },
      },
      include: { Deposit: true, Bonus: true },
    });

    let total = 0;
    pendingTransfers.forEach((transfer) => {
      const parent = transfer.Deposit || transfer.Bonus;
      total += parent!.amount!;
    });

    return total;
  }

  private handleTransferError(coinTransferResult: CoinTransferResult) {
    if (coinTransferResult.error === CONFIG.SD.INSUFICIENT_BALANCE)
      throw new CustomError(ERR.INSUFICIENT_BALANCE);

    if (!coinTransferResult.ok)
      throw new CustomError(ERR.COIN_TRANSFER_UNSUCCESSFUL);
  }
}

/**
 * try
 * transfer = Mandar las fichas()
 *
 * db = Actualizar objeto Payment()
 * responder al cliente player_balance = transfer.player_balance_after
 * catch
 *  db error
 *  Actualizar objeto Payment con "status fichas no mandadas"
 *
 *
 *
 * BEGIN TRANSACTION
 *
 * tx...
 *
 * 1. Actualizar objeto Payment
 * 2. Actualizar objeto CoinTransfer
 *  2.1 status = complete
 *  2.1 player_balance_after = 0
 *
 * 3. Lamada API externa
 *
 * 4. Actualizar objeto CooinTransfer
 *  4.1 player_balance_after = current - payment.amount
 *
 *
 * IF ERROR
 *  ROLLBACK
 * END TRANSACTION
 */
