// import { Deposit, Payment } from "@prisma/client";
// import { TransactionsDAO } from "@/db/transactions";
// import { CustomError } from "@/middlewares/errorHandler";
// import { DepositsDAO } from "@/db/deposits";
// import { HttpService } from "@/services/http.service";
// import { UserRootDAO } from "@/db/user-root";
// import { PlainPlayerResponse } from "@/types/response/players";
// import { PaymentsDAO } from "@/db/payments";
// import { CasinoTokenService } from "@/services/casino-token.service";
// import { TransferRequest, TransferDetails } from "@/types/request/transfers";
// import { Transaction } from "@/types/response/transactions";
// import { TransferResult } from "@/types/response/transfers";
// import { parseTransferResult } from "@/utils/parser";
// import { Notify } from "@/helpers/notification";
// import CONFIG from "@/config";

// /**
//  * Services to be consumed by Player endpoints
//  */
// export class FinanceServices {
//   constructor(
//     private _type: "deposit" | "withdrawal",
//     private _amount: number,
//     private _currency: string,
//     private _playerPanelId: number,
//   ) {}
//   /**
//    * Create deposit, verify it, and transfer coins from agent to player.
//    */
//   async deposit(
//     player: PlainPlayerResponse,
//     request: TransferRequest,
//   ): Promise<TransferResult> {
//     await TransactionsDAO.authorizeTransaction(request.bank_account, player.id);

//     const deposit = await this.createDeposit(player.id, request);

//     return await this.finalizeTransfer(deposit);
//   }

//   /**
//    * Player announces they have completed a pending deposit
//    */
//   async confirmDeposit(
//     player: PlainPlayerResponse,
//     deposit_id: number,
//   ): Promise<TransferResult & { deposit: Deposit }> {
//     await DepositsDAO.authorizeConfirmation(deposit_id, player.id);

//     const deposit = (await DepositsDAO.getById(deposit_id))!;

//     return await this.finalizeTransfer(deposit);
//   }

//   /**
//    * Send payment to player, transfer coins from player to agent and create a
//    * pending payment.
//    */
//   async cashOut(
//     player: PlainPlayerResponse,
//     request: TransferRequest,
//   ): Promise<TransferResult> {
//     await TransactionsDAO.authorizeTransaction(request.bank_account, player.id);

//     const transferResult = await this.transfer();

//     if (transferResult.status === "COMPLETED")
//       this.createPayment(player.id, request);

//     return transferResult;
//   }

//   private async finalizeTransfer(
//     deposit: Deposit,
//   ): Promise<TransferResult & { deposit: Deposit }> {
//     const verifiedDeposit = await this.verifyPayment(deposit);

//     if (!verifiedDeposit.confirmed) {
//       const result: TransferResult = {
//         status: "INCOMPLETE",
//         error: "Deposito no confirmado",
//       };
//       return {
//         ...result,
//         deposit: verifiedDeposit,
//       };
//     }

//     const transferResult = await this.transfer(deposit.id);

//     return {
//       ...transferResult,
//       deposit: verifiedDeposit,
//     };
//   }

//   async transfer(deposit_id?: number): Promise<TransferResult> {
//     const transferDetails = await this.generateTransferDetails();
//     const result = await this.panelTransfer(transferDetails);

//     if (result.status === 201 && transferDetails.type === "deposit")
//       await DepositsDAO.update(deposit_id!, {
//         coins_transfered: new Date().toISOString(),
//       });

//     if (transferDetails.type === "deposit" && result.status !== 201) {
//       const difference =
//         transferDetails.amount - result.data.variables.balance_amount;
//       await Notify.agent({
//         title: "Fichas insuficientes",
//         body: `Necesitas recargar ${difference} fichas para completar transferencias pendientes.`,
//         tag: CONFIG.SD.INSUFICIENT_CREDITS,
//       });
//     }

//     await this.logTransaction(result, transferDetails);
//     return parseTransferResult(result, transferDetails.type);
//   }

//   private async panelTransfer(transferDetails: TransferDetails): Promise<any> {
//     const { authedAgentApi } = new HttpService();
//     const url = "/backoffice/transactions/";
//     const result = await authedAgentApi.post(url, transferDetails);

//     if (result.status !== 201 && result.status !== 400)
//       throw new CustomError({
//         code: "error_transferencia",
//         status: result.status,
//         description: "Error al transferir fichas", //transfer.data
//       });

//     return result;
//   }

//   /**
//    * Log into Transaction History table
//    */
//   private async logTransaction(
//     transfer: any,
//     transferDetails: TransferDetails,
//   ) {
//     const transaction: Transaction = {
//       sender_id: transferDetails.sender_id,
//       recipient_id: transferDetails.recipient_id,
//       amount: transferDetails.amount,
//       date: new Date().toISOString(),
//       status: "INCOMPLETE",
//     };
//     if (transfer.status === 201) {
//       transaction.status = "COMPLETED";
//     } else if (
//       transfer.status === 400 &&
//       transfer.data.code === "transaction_insufficient_balance"
//     ) {
//       transaction.status = "INCOMPLETE";
//     }
//     await TransactionsDAO.logTransaction(transaction);
//   }

//   private async generateTransferDetails(): Promise<TransferDetails> {
//     let agent = await UserRootDAO.getAgent();

//     if (!agent) {
//       const casinoTokenService = new CasinoTokenService();
//       await casinoTokenService.login();
//       agent = await UserRootDAO.getAgent();
//     }

//     let recipient_id, sender_id;

//     switch (this._type) {
//       case "deposit":
//         recipient_id = this._playerPanelId;
//         sender_id = agent!.panel_id;
//         break;
//       case "withdrawal":
//         recipient_id = agent!.panel_id;
//         sender_id = this._playerPanelId;
//         break;
//     }

//     return {
//       recipient_id,
//       sender_id,
//       amount: this._amount,
//       currency: this._currency,
//       type: this._type,
//     };
//   }

//   private async createDeposit(
//     player_id: number,
//     request: TransferRequest,
//   ): Promise<Deposit> {
//     return await DepositsDAO.create({
//       player_id,
//       amount: request.amount,
//       bank_account: request.bank_account,
//       currency: request.currency,
//     });
//   }

//   private async createPayment(
//     player_id: number,
//     request: TransferRequest,
//   ): Promise<Payment> {
//     return await PaymentsDAO.create({
//       player_id,
//       amount: request.amount,
//       bank_account: request.bank_account,
//       currency: request.currency,
//     });
//   }

//   /**
//    * Verify receipt of Player's payment.
//    * @throws CustomError if payment is not verified
//    */
//   private async verifyPayment(
//     deposit: Deposit,
//     // TODO delete
//     verify = false,
//   ): Promise<Deposit> {
//     const delay = 3000;
//     const paymentOk = await new Promise((resolve, _reject) => {
//       setTimeout(() => {
//         resolve(verify);
//       }, delay);
//     });

//     if (paymentOk) {
//       return await DepositsDAO.update(deposit.id, {
//         confirmed: new Date().toISOString(),
//         dirty: false,
//       });
//     }

//     await DepositsDAO.update(deposit.id, { dirty: false });

//     return deposit;
//   }

//   static async showPendingDeposits(player_id: number): Promise<Deposit[]> {
//     const deposits = await DepositsDAO.getPending(player_id);
//     return deposits;
//   }

//   static async deleteDeposit(deposit_id: number, player_id: number) {
//     await DepositsDAO.authorizeDeletion(deposit_id, player_id);
//     await DepositsDAO.delete(deposit_id);
//   }
// }
