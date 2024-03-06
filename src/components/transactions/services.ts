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
  static async deposit(
    player: PlainPlayerResponse,
    request: TransferRequest,
  ): Promise<TransferResult & { deposit: Deposit }> {
    await TransactionsDAO.authorizeTransaction(request.bank_account, player.id);

    const deposit = await this.createDeposit(player.id, request);

    return await this.verifyAndTransfer(deposit, player, false);
  }

  /**
   * Player announces they have completed a pending deposit
   */
  static async confirmDeposit(
    player: PlainPlayerResponse,
    deposit_id: number,
  ): Promise<TransferResult & { deposit: Deposit }> {
    await DepositsDAO.authorizeConfirmation(deposit_id, player.id);

    const deposit = (await DepositsDAO.getById(deposit_id)) as Deposit;

    return await this.verifyAndTransfer(deposit, player, true);
  }

  /**
   * Send payment to player, transfer coins from player to agent and create a
   * pending payment.
   */
  static async cashOut(
    player: PlainPlayerResponse,
    request: TransferRequest,
  ): Promise<TransferResult> {
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

  private static async verifyAndTransfer(
    deposit: Deposit,
    player: PlainPlayerResponse,
    verify: boolean,
  ): Promise<TransferResult & { deposit: Deposit }> {
    deposit = await this.verifyPayment(deposit, verify);

    if (!deposit.confirmed) {
      const result: TransferResult = {
        status: "INCOMPLETE",
        error: "Deposito no confirmado",
      };
      return {
        ...result,
        deposit,
      };
    }

    const transferDetails = await this.generateTransferDetails(
      player.panel_id,
      deposit,
      "deposit",
    );

    const transferResult = await this.transfer(transferDetails);

    return {
      ...transferResult,
      deposit,
    };
  }

  private static async transfer(
    transferDetails: TransferDetails,
  ): Promise<TransferResult> {
    const coinTransfer = await this.coinTransfer(transferDetails);
    await this.logTransaction(coinTransfer, transferDetails);
    return parseTransferResult(coinTransfer, transferDetails.type);
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
    type: "deposit" | "withdrawal",
  ): Promise<TransferDetails> {
    let agent = await UserRootDAO.getAgent();

    if (!agent) {
      const tokenService = new TokenService();
      await tokenService.login();
      agent = await UserRootDAO.getAgent();
    }

    let recipient_id, sender_id;

    switch (type) {
      case "deposit":
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
      type,
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
  private static async verifyPayment(
    deposit: Deposit,
    // TODO delete
    verify = false,
  ): Promise<Deposit> {
    const delay = 3000;
    const paymentOk = await new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(verify);
      }, delay);
    });

    if (paymentOk) {
      return await DepositsDAO.update(deposit.id, {
        confirmed: new Date().toISOString(),
        dirty: false,
      });
    }

    await DepositsDAO.update(deposit.id, { dirty: false });

    return deposit;
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
