import { Bonus, Player, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CoinTransferServices } from "../coin-transfers/services";
import { BONUS_STATUS } from "@/config";
import { BonusDAO } from "@/db/bonus";
import { ResourceService } from "@/services/resource.service";
import { BonusSettings } from "@/types/request/bonus";
import { BonusRedemptionResult } from "@/types/response/bonus";
import { NotFoundException } from "@/helpers/error";
import { useTransaction } from "@/helpers/useTransaction";

export class BonusServices extends ResourceService {
  constructor(private tx?: PrismaTransactionClient) {
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

  /**
   * @returns Bonus | undefined if bonus not found
   */
  async invalidate(player_id: string): Promise<Bonus | undefined> {
    const prisma = this.tx ?? new PrismaClient();
    try {
      return await prisma.bonus.update({
        where: {
          player_id,
          AND: {
            OR: [
              { status: BONUS_STATUS.ASSIGNED },
              { status: BONUS_STATUS.PENDING },
              { status: BONUS_STATUS.REQUESTED },
            ],
          },
        },
        data: { status: BONUS_STATUS.UNAVAILABLE },
      });
    } catch (e: any) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2025")
        return;
      throw e;
    }
  }

  async redeem(
    bonusId: string,
    user: Player,
  ): Promise<BonusRedemptionResult | undefined> {
    let bonus: Bonus = await BonusDAO.authorizeRedemption(bonusId, user);

    return await useTransaction(async (tx) => {
      bonus = await tx.bonus.update({
        where: { id: bonusId },
        data: {
          status: BONUS_STATUS.REDEEMED,
        },
      });

      const coinTransferServices = new CoinTransferServices();
      const coinTransfer = await coinTransferServices.agentToPlayer(
        bonus.coin_transfer_id,
        tx,
      );

      return {
        coinTransfer,
        bonus,
      };
    });
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

    if (bonus.status === BONUS_STATUS.ASSIGNED)
      return await BonusDAO.update(bonus_id, {
        amount,
        status: BONUS_STATUS.PENDING,
      });

    const clientSafeBonus: Bonus & { Player?: Player } = bonus;
    delete clientSafeBonus.Player;
    return clientSafeBonus;
  }
}
