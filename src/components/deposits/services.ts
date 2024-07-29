import { Deposit, Player, Role } from "@prisma/client";
import { BonusServices } from "../bonus/services";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";
import { DepositsDAO } from "@/db/deposits";
import { CustomError } from "@/helpers/error/CustomError";
import { CasinoCoinsService } from "@/services/casino-coins.service";
import {
  DepositRequest,
  DepositUpdateRequest,
} from "@/types/request/transfers";
import { PlainPlayerResponse, RoledPlayer } from "@/types/response/players";
import { CoinTransferResult, DepositResult } from "@/types/response/transfers";
import { hidePassword } from "@/utils/auth";
import { HttpService } from "@/services/http.service";
import { AlqMovementResponse } from "@/types/response/alquimia";
import { logtailLogger } from "@/helpers/loggers";
import { ResourceService } from "@/services/resource.service";
import { BanxicoService } from "@/services/banxico.service";
import { BonusDAO } from "@/db/bonus";

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

    const result = await this.finalizeDeposit(deposit);
    if (
      result.deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED ||
      result.deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED ||
      result.deposit.status === CONFIG.SD.DEPOSIT_STATUS.COMPLETED
    )
      await this.loadWelcomeBonus(player, deposit);

    return result;
  }

  async update(
    agent: Player & { roles: Role[] },
    deposit_id: string,
    request: DepositUpdateRequest,
  ): Promise<Deposit> {
    await DepositsDAO.authorizeUpdate(deposit_id, agent);

    return await DepositsDAO.update(deposit_id, { ...request, dirty: false });
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

    const result = await this.finalizeDeposit(deposit);
    if (
      result.deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED ||
      result.deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED ||
      result.deposit.status === CONFIG.SD.DEPOSIT_STATUS.COMPLETED
    )
      await this.loadWelcomeBonus(player, deposit);

    return result;
  }

  /**
   * @throws DepositResult
   */
  async verify(
    deposit: Deposit & { Player: Player },
  ): Promise<Deposit & { Player: Player }> {
    if (
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED ||
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED
    )
      return deposit;

    const amount = await this.verifyThroughBanxico(deposit);
    if (!amount) {
      throw {
        error: "Deposito no confirmado",
        deposit: await this.markAsPending(deposit),
      } as DepositResult;
    }
    return await this.markAsVerified(deposit, amount);
  }

  async transfer(
    deposit: Deposit & { Player: Player },
  ): Promise<DepositResult> {
    let coinTransferResult: CoinTransferResult = { ok: false };
    try {
      const casinoCoinsService = new CasinoCoinsService();
      coinTransferResult = await casinoCoinsService.agentToPlayer(deposit);
      if (coinTransferResult.ok) deposit = await this.markAsCompleted(deposit);
      else deposit = await DepositsDAO.update(deposit.id, { dirty: false });
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
   * Verify a deposit and send coins to player if deposit confirmed
   */
  async finalizeDeposit(
    deposit: Deposit & { Player: Player },
  ): Promise<DepositResult> {
    try {
      deposit = await this.verify(deposit);
      return await this.transfer(deposit);
    } catch (e) {
      return e as DepositResult;
    }
  }

  /**
   * Verify receipt of Player's deposit through Alquimia.
   */
  public async verifyThroughAlquimia(
    deposit: Deposit,
  ): Promise<number | undefined> {
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

  /**
   * Verify receipt of Player's deposit through Banxico.
   * @throws DepositResult
   */
  public async verifyThroughBanxico(
    deposit: Deposit,
  ): Promise<number | undefined> {
    if (
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED ||
      deposit.status === CONFIG.SD.DEPOSIT_STATUS.CONFIRMED
    )
      return deposit.amount!;

    const banxicoService = new BanxicoService();

    if (deposit.sending_bank === "-1") {
      const bank = await banxicoService.findBank(deposit);
      if (!bank)
        throw {
          error: "Banco no encontrado",
          deposit: await this.markAsPending(deposit),
        } as DepositResult;
      deposit = await DepositsDAO.update(deposit.id, { sending_bank: bank });
    }

    try {
      const amount = await banxicoService.verifyDeposit(deposit);

      return amount;
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      return;
    }
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

  private async loadWelcomeBonus(player: Player, deposit: Deposit) {
    const bonusServices = new BonusServices();
    const bonus_id = (await BonusDAO.findByPlayerId(player.id))[0]?.id;
    if (bonus_id) await bonusServices.load(bonus_id, deposit.amount);
  }
}
