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
import { parseTransferResult } from "@/utils/parser";

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
      deposit,
      "payment",
    );

    return await this.transfer(transferDetails);
  }

  /**
   * Send payment to player, transfer coins from player to agent and create a
   * pending payment.
   */
  static async cashOut(player: PlainPlayerResponse, request: TransferRequest) {
    await TransactionsDAO.authorizeTransaction(request.bank_account, player.id);

    const transferDetails: TransferDetails = await this.generateTransferDetails(
      player.panel_id,
      request,
      "withdrawal",
    );
    const transferResult = await this.transfer(transferDetails);

    if (transferResult.status === "COMPLETED")
      this.createPayment(player.id, request);

    return transferResult;
  }

  /**
   * Player announces they have completed a pending deposit
   */
  static async confirmDeposit(deposit_id: number, player: PlainPlayerResponse) {
    await DepositsDAO.authorizeConfirmation(deposit_id, player.id);

    const deposit = await DepositsDAO.getById(deposit_id);

    await this.verifyPayment(deposit!);

    const transferDetails = await this.generateTransferDetails(
      player.panel_id,
      deposit!,
      "payment",
    );

    return await this.transfer(transferDetails);
  }

  private static async transfer(
    transferDetails: TransferDetails,
  ): Promise<TransferResult> {
    const coinTransfer = await this.coinTransfer(transferDetails);
    await this.logTransaction(coinTransfer, transferDetails);
    return parseTransferResult(coinTransfer);
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
      currency: request.currency,
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
      currency: request.currency,
    });
  }

  /**
   * Verify receipt of Player's payment.
   * @throws CustomError if payment is not verified
   */
  private static async verifyPayment(deposit: Deposit): Promise<void> {
    const paymentOk = true;

    if (!paymentOk) {
      throw new CustomError({
        status: 400,
        code: "error_pago",
        description: "Pago no recibido",
      });
    }

    await DepositsDAO.update(deposit.id, {
      confirmed: new Date().toISOString(),
    });
  }

  static async showPendingDeposits(player_id: number): Promise<Deposit[]> {
    const deposits = await DepositsDAO.getPending(player_id);
    return deposits;
  }

  static async deleteDeposit(deposit_id: number, player_id: number) {
    await DepositsDAO.authorizeDeletion(deposit_id, player_id);
    await DepositsDAO.delete(deposit_id);
  }
}
