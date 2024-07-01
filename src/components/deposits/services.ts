import { Deposit, Player } from "@prisma/client";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";
import { DepositsDAO } from "@/db/deposits";
import { CustomError } from "@/helpers/error/CustomError";
import { CasinoCoinsService } from "@/services/casino-coins.service";
import { DepositRequest } from "@/types/request/transfers";
import { PlainPlayerResponse, RoledPlayer } from "@/types/response/players";
import { CoinTransferResult, DepositResult } from "@/types/response/transfers";
import { hidePassword } from "@/utils/auth";
import { HttpService } from "@/services/http.service";
import { AlqMovementResponse } from "@/types/response/alquimia";
import { logtailLogger } from "@/helpers/loggers";
import { ResourceService } from "@/services/resource.service";

export class DepositServices extends ResourceService {
  constructor() {
    super(DepositsDAO);
  }

  /**
   * Create deposit, verify it, and transfer coins from agent to player.
   */
  async create(
    player: PlainPlayerResponse,
    request: DepositRequest,
  ): Promise<DepositResult> {
    await DepositsDAO.authorizeCreation(request);

    const deposit = await DepositsDAO.create({
      ...request,
      player_id: player.id,
    });

    return await this.finalizeDeposit(deposit);
  }
  /**
   * Player announces they have completed a pending deposit
   */
  async confirm(
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
   * Verify a deposit and send coins to player if deposit confirmed
   */
  private async finalizeDeposit(
    deposit: Deposit & { Player: Player },
  ): Promise<DepositResult> {
    if (
      deposit.status !== CONFIG.SD.DEPOSIT_STATUS.VERIFIED &&
      deposit.status !== CONFIG.SD.DEPOSIT_STATUS.CONFIRMED
    ) {
      const amount = await this.verify(deposit);
      if (!amount) {
        return {
          error: "Deposito no confirmado",
          deposit: await this.markAsPending(deposit),
        };
      }
      deposit = await this.markAsVerified(deposit, amount);
    }
    let coinTransferResult: CoinTransferResult = { ok: false };
    try {
      const casinoCoinsService = new CasinoCoinsService();
      coinTransferResult = await casinoCoinsService.agentToPlayer(deposit);
      if (coinTransferResult.ok) deposit = await this.markAsCompleted(deposit);
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      if (e instanceof CustomError && e.code === ERR.TRANSACTION_LOG.code)
        deposit = await this.markAsConfirmed(deposit);
      else deposit = await this.markAsCompleted(deposit);
      logtailLogger.warn({ err: e });
    }

    deposit.Player = hidePassword(deposit.Player);
    return {
      player_balance: coinTransferResult?.player_balance,
      error: coinTransferResult?.error,
      deposit,
    };
  }

  /**
   * Verify receipt of Player's deposit.
   */
  public async verify(deposit: Deposit): Promise<number | undefined> {
    if (
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED ||
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED
    )
      return deposit.amount!;

    try {
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

  /**
   * Find a deposit in Alquimia's database by tracking number
   */
  private async alquimiaDepositLookup(
    tracking_number: string,
  ): Promise<AlqMovementResponse | undefined> {
    const accountId = CONFIG.EXTERNAL.ALQ_SAVINGS_ACCOUNT_ID;
    const endpoint = `cuenta-ahorro-cliente/${accountId}/transaccion`;

    const httpService = new HttpService();
    const movements = await httpService.authedAlqApi.get<AlqMovementResponse[]>(
      `${endpoint}?clave_rastreo=${tracking_number}`,
    );

    if (movements.data.length === 0) return;
    return movements.data.find((movement) => movement.valor_real > 0);
  }

  private markAsPending(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
    });
  }

  private markAsVerified(
    deposit: Deposit,
    amount: number,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED,
      amount,
    });
  }

  private markAsConfirmed(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.CONFIRMED,
    });
  }

  private markAsCompleted(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player }> {
    return DepositsDAO.update(deposit.id, {
      dirty: false,
      status: CONFIG.SD.DEPOSIT_STATUS.COMPLETED,
    });
  }

  /**
   * Show deposits which have pending actions
   */
  static async showPending(player_id: string): Promise<Deposit[]> {
    const deposits = await DepositsDAO.getPending(player_id);
    return deposits;
  }

  static async pendingCoinTransfers(): Promise<number> {
    const deposits = await DepositsDAO.getPendingCoinTransfers();
    let total = 0;
    deposits.forEach((deposit) => {
      total += deposit.amount!;
    });

    return total;
  }
}
