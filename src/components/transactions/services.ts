import { AlquimiaDeposit, Deposit, Payment, Player } from "@prisma/client";
import { AxiosResponse } from "axios";
import { DepositsDAO } from "@/db/deposits";
import { HttpService } from "@/services/http.service";
import { PlainPlayerResponse, RoledPlayer } from "@/types/response/players";
import { PaymentsDAO } from "@/db/payments";
import { CashoutRequest, DepositRequest } from "@/types/request/transfers";
import { parseAlqMovement } from "@/utils/parser";
import CONFIG from "@/config";
import { CoinTransferResult, DepositResult } from "@/types/response/transfers";
import { AlquimiaDepositDAO } from "@/db/alq-deposits";
import { AlqMovementResponse } from "@/types/response/alquimia";
import { CasinoCoinsService } from "@/services/casino-coins.service";
import { ERR } from "@/config/errors";
import { hidePassword } from "@/utils/auth";
import { CustomError } from "@/helpers/error/CustomError";

/**
 * Services to be consumed by Player endpoints
 */
export class FinanceServices {
  /**
   * Create deposit, verify it, and transfer coins from agent to player.
   */
  async deposit(
    player: PlainPlayerResponse,
    request: DepositRequest,
  ): Promise<DepositResult> {
    await DepositsDAO.authorizeCreation(request);

    const deposit = await this.createDeposit(player.id, request);

    return await this.finalizeDeposit(deposit);
  }

  /**
   * Player announces they have completed a pending deposit
   */
  async confirmDeposit(
    player: RoledPlayer,
    deposit_id: string,
    request: DepositRequest,
  ): Promise<DepositResult> {
    await DepositsDAO.authorizeConfirmation(
      deposit_id,
      request.tracking_number,
      player,
    );

    const deposit = (await DepositsDAO.update(deposit_id, request))!;

    return await this.finalizeDeposit(deposit);
  }

  /**
   * Send payment to player, transfer coins from player to agent and create a
   * pending payment.
   */
  async cashOut(
    player: PlainPlayerResponse,
    request: CashoutRequest,
  ): Promise<CoinTransferResult> {
    await PaymentsDAO.authorizeCreation(request.bank_account, player.id);
    const casinoCoinsService = new CasinoCoinsService();
    let transferResult: CoinTransferResult | undefined;
    try {
      transferResult = await casinoCoinsService.playerToAgent(request, player);

      if (transferResult.ok) this.createPayment(player, request);
      return transferResult;
    } catch (e) {
      if (
        e instanceof CustomError &&
        e.code === ERR.TRANSACTION_LOG.code &&
        transferResult?.ok
      ) {
        this.createPayment(player, request);
        return transferResult;
      }
      throw e;
    }
  }

  /**
   * Verify a deposit and send coins to player if deposit confirmed
   */
  private async finalizeDeposit(
    deposit: Deposit & { Player: Player },
  ): Promise<DepositResult> {
    if (
      deposit.status !== CONFIG.SD.DEPOSIT_STATUS.VERIFIED &&
      deposit.status !== CONFIG.SD.DEPOSIT_STATUS.CONFIRMED
    ) {
      const amount = await this.verifyPayment(deposit);
      if (!amount) {
        return {
          error: "Deposito no confirmado",
          deposit: await this.markDepositAsPending(deposit),
        };
      }
      deposit = await this.markDepositAsVerified(deposit, amount);
    }
    let coinTransferResult: CoinTransferResult = { ok: false };
    try {
      const casinoCoinsService = new CasinoCoinsService();
      coinTransferResult = await casinoCoinsService.agentToPlayer(deposit);
      if (coinTransferResult.ok)
        deposit = await this.markDepositAsCompleted(deposit);
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      if (e instanceof CustomError && e.code === ERR.TRANSACTION_LOG.code)
        deposit = await this.markDepositAsConfirmed(deposit);
      else deposit = await this.markDepositAsCompleted(deposit);
      // TODO
      // Notify, something went wrong
    }

    deposit.Player = hidePassword(deposit.Player);
    return {
      player_balance: coinTransferResult?.player_balance,
      error: coinTransferResult?.error,
      deposit,
    };
  }

  /**
   * Verify receipt of Player's payment.
   */
  public async verifyPayment(deposit: Deposit): Promise<number | undefined> {
    if (
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED ||
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED
    )
      return deposit.amount!;

    try {
      const localDeposit = await AlquimiaDepositDAO.findByTrackingNumber(
        deposit.tracking_number,
      );

      if (localDeposit) return localDeposit.valor_real;

      const alqDeposit = await this.alquimiaDepositLookup(
        deposit.tracking_number,
      );

      if (alqDeposit) return alqDeposit.valor_real;

      return;
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      return;
    }
  }

  private async createDeposit(
    player_id: string,
    request: DepositRequest,
  ): Promise<Deposit & { Player: Player }> {
    return await DepositsDAO.create({
      ...request,
      player_id,
    });
  }

  private async createPayment(
    player: Player,
    request: CashoutRequest,
  ): Promise<Payment> {
    return await PaymentsDAO.create({
      player_id: player.id,
      amount: request.amount,
      bank_account: request.bank_account,
      currency: player.balance_currency,
    });
  }

  private markDepositAsPending(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
    });
  }

  private markDepositAsVerified(
    deposit: Deposit,
    amount: number,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED,
      amount,
    });
  }

  private markDepositAsConfirmed(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.CONFIRMED,
    });
  }

  private markDepositAsCompleted(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.COMPLETED,
    });
  }

  /**
   * Find a deposit in Alquimia's database by tracking number
   */
  private async alquimiaDepositLookup(
    tracking_number: string,
    from?: Date,
    page = 1,
  ): Promise<AlqMovementResponse | undefined> {
    // TODO
    // Look up by clave_rastreo with
    // searchParams.set("clave_rastreo", tracking_number)
    const accountId = CONFIG.EXTERNAL.ALQ_SAVINGS_ACCOUNT_ID;
    const endpoint = `cuenta-ahorro-cliente/${accountId}/transaccion`;
    const PAGE_SIZE = 20;

    if (page === 1) {
      const lastMovement = await AlquimiaDepositDAO.findLatest();
      if (lastMovement) from = new Date(lastMovement.fecha_operacion);
    }

    const searchParams = new URLSearchParams();
    const startDate = from ? from.toISOString().split("T")[0] : "";
    startDate && searchParams.set("fecha_inicio", startDate);
    searchParams.set("registros", `${PAGE_SIZE}`);
    searchParams.set("page", page.toString());

    const httpService = new HttpService();
    const movements: AxiosResponse = await httpService.authedAlqApi.get(
      endpoint + "?" + searchParams.toString(),
    );

    if (movements.data.length === 0) return;

    await this.syncMovements(movements.data);

    const found = (movements.data as AlqMovementResponse[]).find(
      (movement) => movement.clave_rastreo === tracking_number,
    );

    if (!found && movements.data.length === PAGE_SIZE)
      return await this.alquimiaDepositLookup(tracking_number, from, page + 1);

    return found;
  }

  /**
   * Sync Alquimia data into local DB
   */
  private syncMovements(movements: AlqMovementResponse[]) {
    // TODO
    // Chequear que tipo_operacion = 1 sean depósitos
    const deposits: AlquimiaDeposit[] = movements
      .filter((movement) => movement.tipo_operacion === 1)
      .map(parseAlqMovement);

    if (!deposits) return;

    return AlquimiaDepositDAO.createMany(deposits);
  }

  /**
   * Show deposits which have pending actions
   */
  static async showPendingDeposits(player_id: string): Promise<Deposit[]> {
    const deposits = await DepositsDAO.getPending(player_id);
    return deposits;
  }
}
