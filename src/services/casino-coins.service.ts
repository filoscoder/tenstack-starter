import { Deposit, Player } from "@prisma/client";
import { AxiosResponse } from "axios";
import { HttpService } from "./http.service";
import CONFIG from "@/config";
import { TransactionsDAO } from "@/db/transactions";
import { UserRootDAO } from "@/db/user-root";
import { CashoutRequest, TransferDetails } from "@/types/request/transfers";
import { Transaction } from "@/types/response/transactions";
import { parseTransferResult } from "@/utils/parser";
import { CoinTransferResult } from "@/types/response/transfers";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";
import { AgentApiError } from "@/helpers/error/AgentApiError";
import { WebPush } from "@/notification/web-push";

/**
 * Interact with the casino's coins transfer endpoints and log results into
 * TRANSACTIONS table
 *
 */
export class CasinoCoinsService {
  /**
   * Transfer coins from player to agent (Cashout)
   * @throws AgentApiError
   * @throws CustomError (transaction_log)
   */
  async playerToAgent(
    cashOutRequest: CashoutRequest,
    player: Player,
  ): Promise<CoinTransferResult> {
    const transferDetails = await this.generateTransferDetails(
      "cashout",
      player.panel_id,
      cashOutRequest.amount,
      player.balance_currency,
    );
    const result = await this.transfer(transferDetails);
    const parsedResult = parseTransferResult(result, transferDetails.type);
    await this.logTransaction(parsedResult.ok, transferDetails);
    return parsedResult;
  }

  /**
   * Transfer coins from agent to player (Deposit)
   * @throws AgentApiError
   * @throws CustomError (transaction_log)
   */
  async agentToPlayer(
    deposit: Deposit & { Player: Player },
  ): Promise<CoinTransferResult> {
    const transferDetails = await this.generateTransferDetails(
      "deposit",
      deposit.Player.panel_id,
      deposit.amount!,
      deposit.Player.balance_currency,
    );

    if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED) {
      await this.logTransaction(true, transferDetails);
      return { ok: true };
    }

    const result = await this.transfer(transferDetails);
    if (result.data.code == "insuficient_balance") {
      const difference =
        transferDetails.amount - result.data.variables.balance_amount;
      await WebPush.agent({
        title: "Fichas insuficientes",
        body: `Necesitas recargar ${difference} fichas para completar transferencias pendientes.`,
        tag: CONFIG.SD.INSUFICIENT_CREDITS,
      });
    }
    const parsedResult = parseTransferResult(result, transferDetails.type);
    await this.logTransaction(parsedResult.ok, transferDetails);
    return parsedResult;
  }

  /**
   * Send coins
   * @throws AgentApiError
   */
  private async transfer(
    transferDetails: TransferDetails,
  ): Promise<AxiosResponse> {
    const { authedAgentApi } = new HttpService();
    const url = "/backoffice/transactions/";
    const result = await authedAgentApi.post<any>(url, transferDetails);

    if (result.status !== 201 && result.status !== 400)
      throw new AgentApiError(
        result.status,
        "Error en el panel al transferir fichas",
        result.data,
      );
    return result;
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

  /**
   * Log into Transaction History table
   * @throws CustomError (transaction_log)
   */
  private async logTransaction(ok: boolean, transferDetails: TransferDetails) {
    try {
      const transaction: Transaction = {
        sender_id: transferDetails.sender_id,
        recipient_id: transferDetails.recipient_id,
        amount: transferDetails.amount,
        date: new Date().toISOString(),
        ok,
      };
      await TransactionsDAO.create(transaction);
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      throw new CustomError(ERR.TRANSACTION_LOG);
    }
  }
}
