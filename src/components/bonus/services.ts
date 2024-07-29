import { Bonus, Player } from "@prisma/client";
import CONFIG from "@/config";
import { BonusDAO } from "@/db/bonus";
import { ResourceService } from "@/services/resource.service";
import { BonusSettings } from "@/types/request/bonus";
import { CasinoCoinsService } from "@/services/casino-coins.service";
import { logtailLogger } from "@/helpers/loggers";
import { BonusRedemptionResult } from "@/types/response/bonus";
import { CoinTransferResult } from "@/types/response/transfers";
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
          ],
        },
      },
      { status: CONFIG.SD.BONUS_STATUS.UNAVAILABLE },
    );
  }

  async redeem(bonusId: string, user: Player): Promise<BonusRedemptionResult> {
    const bonus: Bonus & { Player?: Player } =
      await BonusDAO.authorizeRedemption(bonusId, user);
    const casinoCoinsService = new CasinoCoinsService();

    let transferResult: CoinTransferResult = { ok: false };
    try {
      const request: CoinTransferRequest = {
        amount: bonus.amount,
        currency: bonus.Player!.balance_currency,
        panel_id: bonus.Player!.panel_id,
      };
      transferResult = await casinoCoinsService.bonusAgentToPlayer(request);
    } catch (e: any) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      logtailLogger.warn({ err: e });
    }

    delete bonus.Player;
    return {
      error: transferResult.error,
      player_balance: transferResult.player_balance,
      bonus,
    };
  }

  /**
   * Set bonus' amount according to bonus percentage and Deposit amount
   */
  async load(bonus_id: string, deposit_amount: number): Promise<Bonus> {
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
