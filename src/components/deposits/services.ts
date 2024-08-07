import { Bonus, Deposit, Player, PrismaClient, Role } from "@prisma/client";
import CONFIG from "@/config";
import { DepositsDAO } from "@/db/deposits";
import {
  DepositRequest,
  SetDepositStatusRequest,
} from "@/types/request/transfers";
import { PlainPlayerResponse, RoledPlayer } from "@/types/response/players";
import { HttpService } from "@/services/http.service";
import { AlqMovementResponse } from "@/types/response/alquimia";
import { ResourceService } from "@/services/resource.service";
import { BanxicoService } from "@/services/banxico.service";
import { CoinTransferDAO } from "@/db/coin-transfer";

export class DepositServices extends ResourceService {
  constructor() {
    super(DepositsDAO);
  }

  /**
   * Create and verify deposit.
   */
  async create(player: PlainPlayerResponse, request: DepositRequest) {
    await DepositsDAO.authorizeCreation(request);

    const coinTransfer = await CoinTransferDAO.create({});

    const deposit = await DepositsDAO.create({
      data: {
        ...request,
        player_id: player.id,
        coin_transfer_id: coinTransfer.id,
        status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
      },
    });

    return await this.verify(deposit);
  }

  /**
   * Update and verify an existing deposit
   */
  async update(
    player: RoledPlayer,
    deposit_id: string,
    request: DepositRequest,
  ) {
    await DepositsDAO.authorizeUpdate(
      deposit_id,
      player,
      request.tracking_number,
    );

    const deposit = await DepositsDAO.update({
      where: { id: deposit_id },
      data: request,
    });

    return await this.verify(deposit);
  }

  async setStatus(
    agent: Player & { roles: Role[] },
    deposit_id: string,
    request: SetDepositStatusRequest,
  ): Promise<Deposit> {
    await DepositsDAO.authorizeUpdate(deposit_id, agent);

    return await DepositsDAO.update({
      where: { id: deposit_id },
      data: { ...request, dirty: false },
    });
  }

  async verify(
    deposit: Deposit,
  ): Promise<Deposit & { Player: Player & { Bonus: Bonus | null } }> {
    // if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED) return deposit;

    const amount = await this.verifyThroughBanxico(deposit);

    if (amount) return await this.markAsVerified(deposit, amount);

    return await this.markAsUnverified(deposit);
  }

  // async transfer(
  //   deposit: Deposit & { Player: Player },
  // ): Promise<DepositResult> {
  //   let coinTransferResult: CoinTransferResult = { ok: false };
  //   try {
  //     const casinoCoinsService = new CasinoCoinsService();
  //     coinTransferResult = await casinoCoinsService.agentToPlayer(deposit);
  //     if (coinTransferResult.ok) deposit = await this.markAsCompleted(deposit);
  //     else deposit = await DepositsDAO.update(deposit.id, { dirty: false });
  //   } catch (e) {
  //     if (CONFIG.LOG.LEVEL === "debug") console.error(e);
  //     if (e instanceof CustomError && e.code === ERR.TRANSACTION_LOG.code)
  //       deposit = await this.markAsConfirmed(deposit);
  //     else deposit = await this.markAsCompleted(deposit);
  //     logtailLogger.warn({ err: e });
  //   }

  //   deposit.Player = hidePassword(deposit.Player);
  //   return {
  //     player_balance: coinTransferResult?.player_balance,
  //     error: coinTransferResult?.error,
  //     deposit,
  //   };
  // }

  /**
   * Verify a deposit and send coins to player if deposit confirmed
   */
  // async finalizeDeposit(
  //   deposit: Deposit},
  // ): Promise<DepositResult> {
  //   try {
  //     deposit = await this.verify(deposit);
  //     // return await this.transfer(deposit);
  //   } catch (e) {
  //     return e as DepositResult;
  //   }
  // }

  /**
   * Verify receipt of Player's deposit through Alquimia.
   */
  public async verifyThroughAlquimia(
    deposit: Deposit,
  ): Promise<number | undefined> {
    if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED)
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
   * @returns verified deposit amount
   */
  public async verifyThroughBanxico(
    deposit: Deposit,
  ): Promise<number | undefined> {
    if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.VERIFIED)
      return deposit.amount!;

    const banxicoService = new BanxicoService();

    if (deposit.sending_bank === "-1") {
      const bank = await banxicoService.findBank(deposit);
      if (!bank) return;

      deposit = await DepositsDAO.update({
        where: { id: deposit.id },
        data: { sending_bank: bank },
      });
    }

    try {
      return await banxicoService.verifyDeposit(deposit);
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      return;
    }
  }

  // private markAsPending(
  //   deposit: Deposit,
  // ): Promise<Deposit & { Player: Player }> {
  //   return DepositsDAO.update(deposit.id, {
  //     dirty: false,
  //     status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
  //   });
  // }

  private markAsVerified(deposit: Deposit, amount: number) {
    const prisma = new PrismaClient();
    return prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED,
        amount,
        dirty: false,
      },
      include: { Player: { include: { Bonus: true } } },
    });
  }

  private markAsUnverified(deposit: Deposit) {
    const prisma = new PrismaClient();
    return prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        dirty: false,
        status: CONFIG.SD.DEPOSIT_STATUS.UNVERIFIED,
      },
      include: { Player: { include: { Bonus: true } } },
    });
  }

  // private markAsConfirmed(
  //   deposit: Deposit,
  // ): Promise<Deposit & { Player: Player }> {
  //   return DepositsDAO.update(deposit.id, {
  //     dirty: false,
  //     status: CONFIG.SD.DEPOSIT_STATUS.CONFIRMED,
  //   });
  // }

  // private markAsCompleted(
  //   deposit: Deposit,
  // ): Promise<Deposit & { Player: Player }> {
  //   return DepositsDAO.update(deposit.id, {
  //     dirty: false,
  //     status: CONFIG.SD.DEPOSIT_STATUS.COMPLETED,
  //   });
  // }

  /**
   * Show deposits which have pending actions
   */
  static async showPending(player_id: string): Promise<Deposit[]> {
    const deposits = await DepositsDAO.getPending(player_id);

    return deposits;
  }

  // static async pendingCoinTransfers(): Promise<number> {
  //   const deposits = await DepositsDAO.getPendingCoinTransfers();
  //   let total = 0;
  //   deposits.forEach((deposit) => {
  //     total += deposit.amount!;
  //   });

  //   return total;
  // }

  // async loadWelcomeBonus(
  //   player: Player,
  //   deposit: Deposit,
  // ): Promise<Bonus | null> {
  //   if (deposit.status !== CONFIG.SD.DEPOSIT_STATUS.VERIFIED) return null;

  //   const bonusServices = new BonusServices();
  //   const bonus_id = (await BonusDAO.findByPlayerId(player.id))[0]?.id;

  //   if (bonus_id) return await bonusServices.load(bonus_id, deposit.amount);

  //   return null;
  // }
}
