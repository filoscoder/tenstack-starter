import { Bonus, Player } from "@prisma/client";
import CONFIG from "@/config";
import { BonusDAO } from "@/db/bonus";
import { ResourceService } from "@/services/resource.service";
import { BonusSettings } from "@/types/request/bonus";
import { CasinoCoinsService } from "@/services/casino-coins.service";
import { BonusRedemptionResult } from "@/types/response/bonus";
import { NotFoundException } from "@/helpers/error";

export class BonusServices extends ResourceService {
  constructor() {
    super(BonusDAO);
  }

  async create(player_id: string): Promise<Bonus> {
    await BonusDAO.authorizeCreation(player_id);
    const settings = this.getSettings();

    return await BonusDAO.create({ player_id, ...settings });
  }

  private getSettings(): BonusSettings {
    return { percentage: 100, amount: 0 };
  }

  async invalidate(player_id: string): Promise<Bonus> {
    return await BonusDAO.updateWhere(
      {
        player_id,
        AND: {
          OR: [
            { status: CONFIG.SD.BONUS_STATUS.ASSIGNED },
            { status: CONFIG.SD.BONUS_STATUS.PENDING },
            { status: CONFIG.SD.BONUS_STATUS.REQUESTED },
          ],
        },
      },
      { status: CONFIG.SD.BONUS_STATUS.UNAVAILABLE },
    );
  }

  async redeem(bonusId: string, user: Player): Promise<BonusRedemptionResult> {
    const bonus: Bonus = await BonusDAO.authorizeRedemption(bonusId, user);
    const casinoCoinsService = new CasinoCoinsService();

    // let coinTransfer: CoinTransferResult = { ok: false };
    // try {
    const coinTransfer = await casinoCoinsService.agentToPlayer(
      bonus.coin_transfer_id,
    );
    // } catch (e: any) {
    //   if (CONFIG.LOG.LEVEL === "debug") console.error(e);
    //   logtailLogger.warn({ err: e });
    // }

    // delete bonus.Player;
    return {
      coinTransfer,
      bonus,
    };
  }

  /**
   * Set bonus' amount according to bonus percentage and Deposit amount.
   * Only if bonus is in ASSIGNED status
   */
  async load(
    deposit_amount: number,
    bonus_id?: string,
  ): Promise<Bonus | undefined> {
    if (!bonus_id) return;
    const bonus = await BonusDAO._getById(bonus_id);
    if (!bonus) throw new NotFoundException("Bonus not found");

    const amount = (bonus.percentage / 100) * deposit_amount;

    if (bonus.status === CONFIG.SD.BONUS_STATUS.ASSIGNED)
      return await BonusDAO.update(bonus_id, {
        amount,
        status: CONFIG.SD.BONUS_STATUS.PENDING,
      });

    const clientSafeBonus: Bonus & { Player?: Player } = bonus;
    delete clientSafeBonus.Player;
    return clientSafeBonus;
  }
}
