import { Deposit, Payment } from "@prisma/client";
import { TransactionsDAO } from "@/db/transactions";
import { CustomError } from "@/middlewares/errorHandler";
import { DepositsDAO } from "@/db/deposits";
import { HttpService } from "@/services/http.service";
import { UserRootDAO } from "@/db/user-root";
import { PlainPlayerResponse } from "@/types/response/players";
import { PaymentsDAO } from "@/db/payments";
import { TokenService } from "@/services/token.service";
import { TransferRequest, TransferDetails } from "@/types/request/transfers";
import { Transaction } from "@/types/response/transactions";
import { TransferResult } from "@/types/response/transfers";

export class FinanceServices {
  /**
   * Create deposit, verify it, and transfer coins from agent to player.
   */
  static async cashIn(player: PlainPlayerResponse, request: TransferRequest) {
    await TransactionsDAO.authorizeTransaction(request.bank_account, player.id);

    const deposit = await this.createDeposit(player.id, request);

    await this.verifyPayment(deposit);

    const transferDetails = await this.generateTransferDetails(
      player.panel_id,
      request,
      "payment",
    );

    const coinTransfer = await this.coinTransfer(transferDetails);
    await this.logTransaction(coinTransfer, transferDetails);
    const transferResult = this.parseTransferResult(coinTransfer);

    return transferResult;
  }

  /**
   * Send payment to player, transfer coins from player to agent and create a
   * pending payment.
   */
  static async cashOut(player: PlainPlayerResponse, request: TransferRequest) {
    await TransactionsDAO.authorizeTransaction(request.bank_account, player.id);

    const transferDetails = await this.generateTransferDetails(
      player.panel_id,
      request,
      "withdrawal",
    );

    const coinTransfer = await this.coinTransfer(transferDetails);
    await this.logTransaction(coinTransfer, transferDetails);
    const transferResult = this.parseTransferResult(coinTransfer);
    if (transferResult.status === "COMPLETED")
      this.createPayment(player.id, request);

    return transferResult;
  }

  private static async coinTransfer(
    transferDetails: TransferDetails,
  ): Promise<any> {
    const { authedAgentApi } = new HttpService();
    const url = "/backoffice/transactions/";
    const transfer = await authedAgentApi.post(url, transferDetails);

    if (transfer.status !== 201 && transfer.status !== 400)
      throw new CustomError({
        code: "error_transferencia",
        status: transfer.status,
        description: "Error al transferir fichas", //transfer.data
      });

    return transfer;
  }

  /**
   * Log into Transaction History table
   */
  private static async logTransaction(
    transfer: any,
    transferDetails: TransferDetails,
  ) {
    const transaction: Transaction = {
      sender_id: transferDetails.sender_id,
      recipient_id: transferDetails.recipient_id,
      amount: transferDetails.amount,
      date: new Date().toISOString(),
      status: "INCOMPLETE",
    };
    if (transfer.status === 201) {
      transaction.status = "COMPLETED";
    } else if (
      transfer.status === 400 &&
      transfer.data.code === "transaction_insufficient_balance"
    ) {
      transaction.status = "INCOMPLETE";
    }
    await TransactionsDAO.logTransaction(transaction);
  }

  private static parseTransferResult(transfer: any): TransferResult {
    const ok = transfer.status === 201;
    const result: TransferResult = {
      status: ok ? "COMPLETED" : "INCOMPLETE",
      sender_balance: ok
        ? transfer.data.sender_balance_after
        : transfer.data.variables.balance_amount,
      recipient_balance: ok ? transfer.data.recipient_balance_after : null,
      error: ok ? undefined : "Saldo insuficiente",
    };
    return result;
  }

  private static async generateTransferDetails(
    panel_id: number,
    request: TransferRequest,
    type: "payment" | "withdrawal",
  ): Promise<TransferDetails> {
    let agent = await UserRootDAO.getAgent();

    if (!agent) {
      const tokenService = new TokenService();
      await tokenService.login();
      agent = await UserRootDAO.getAgent();
    }

    let recipient_id, sender_id;

    switch (type) {
      case "payment":
        recipient_id = panel_id;
        sender_id = agent!.panel_id;
        break;
      case "withdrawal":
        recipient_id = agent!.panel_id;
        sender_id = panel_id;
        break;
    }

    return {
      recipient_id,
      sender_id,
      amount: request.amount,
      currency: request.currency,
    };
  }

  private static async createDeposit(
    player_id: number,
    request: TransferRequest,
  ): Promise<Deposit> {
    return await DepositsDAO.create({
      player_id,
      amount: request.amount,
      bank_account: request.bank_account,
    });
  }

  private static async createPayment(
    player_id: number,
    request: TransferRequest,
  ): Promise<Payment> {
    return await PaymentsDAO.create({
      player_id,
      amount: request.amount,
      bank_account: request.bank_account,
    });
  }

  /**
   * Verify receipt of Player's payment.
   * @throws CustomError if payment is not verified
   */
  private static async verifyPayment(_deposit: Deposit): Promise<void> {
    // TODO
    // Mark deposit as confirmed
    const paymentOk = true;

    if (!paymentOk) {
      throw new CustomError({
        status: 400,
        code: "error_pago",
        description: "Pago no recibido",
      });
    }
  }
}
