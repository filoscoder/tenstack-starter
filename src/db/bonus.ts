import { Bonus, Player, Prisma, PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import CONFIG from "@/config";
import { OrderBy } from "@/types/request/players";
import { BonusUpdatableProps, CreateBonusProps } from "@/types/request/bonus";
import { RoledPlayer } from "@/types/response/players";
import { PlayerServices } from "@/components/players/services";

const prisma = new PrismaClient();

export class BonusDAO {
  static _getAll = async (
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Bonus>,
  ): Promise<Bonus[]> => {
    try {
      const bonus = await prisma.bonus.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
        where: {
          OR: [
            { status: { contains: search } },
            { amount: { equals: Number(search) } },
            { Player: { username: { contains: search } } },
            { Player: { first_name: { contains: search } } },
            { Player: { last_name: { contains: search } } },
          ],
        },
        orderBy,
        include: { Player: true },
      });
      return bonus;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static async _getById(id: string) {
    try {
      return await prisma.bonus.findUnique({
        where: { id },
        include: { Player: true },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static findMany(where: Prisma.BonusWhereInput) {
    try {
      return prisma.bonus.findMany({ where });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static findByPlayerId(player_id: string) {
    try {
      return prisma.bonus.findMany({ where: { player_id } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async count() {
    return prisma.bonus.count();
  }

  static async create(data: CreateBonusProps): Promise<Bonus> {
    try {
      const bonus = await prisma.bonus.create({
        data: {
          ...data,
          player_id: undefined,
          status: data.status ?? CONFIG.SD.BONUS_STATUS.ASSIGNED,
          CoinTransfer: {
            create: { status: CONFIG.SD.COIN_TRANSFER_STATUS.PENDING },
          },
          Player: { connect: { id: data.player_id } },
        },
      });
      return bonus;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async update(id: string, data: BonusUpdatableProps): Promise<Bonus> {
    try {
      const bonus = await prisma.bonus.update({
        where: { id },
        data,
        // include: { Player: true },
      });
      return bonus;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async updateWhere(
    where: Prisma.BonusWhereUniqueInput,
    data: BonusUpdatableProps,
  ): Promise<Bonus> {
    try {
      const bonus = await prisma.bonus.update({
        where,
        data,
      });
      return bonus;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static delete(id: string) {
    try {
      return prisma.bonus.delete({ where: { id } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async authorizeCreation(player_id: string) {
    try {
      const bonus = await prisma.bonus.findUnique({
        where: { player_id: player_id },
      });
      if (bonus) throw new ForbiddenError("Player already has a bonus");
      return bonus;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async authorizeView(bonus_id: string, player: RoledPlayer) {
    try {
      const bonus = await prisma.bonus.findUnique({
        where: { id: bonus_id },
        include: { Player: true },
      });
      if (!bonus) throw new NotFoundException("Bonus not found");
      if (
        bonus.Player.id !== player.id &&
        !player.roles.some((r) => r.name === CONFIG.ROLES.AGENT)
      )
        throw new ForbiddenError("Unauthorized");
      return bonus;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async authorizeRedemption(
    bonusId: string,
    user: Player,
  ): Promise<Bonus> {
    const playerServices = new PlayerServices();
    const authorized = await prisma.$transaction(async (tx) => {
      const bonus = await tx.bonus.findUnique({
        where: { id: bonusId },
        include: { Player: { include: { roles: true } } },
      });

      if (!bonus) throw new NotFoundException("Bonus not found");

      if (bonus.Player.id !== user.id) throw new ForbiddenError("Unauthorized");

      const balance = await playerServices.getBalance(
        bonus.Player.id,
        bonus.Player,
      );
      if (balance >= 10)
        throw new ForbiddenError(
          "El bono solo se puede canjear cuando el balance es menor que 10.",
        );

      if (bonus.status === CONFIG.SD.BONUS_STATUS.UNAVAILABLE)
        throw new ForbiddenError("Lo siento, tu bono ya no esta disponible.");

      if (bonus.status === CONFIG.SD.BONUS_STATUS.REDEEMED)
        throw new ForbiddenError(
          "Ya has canjeado tu bono, gracias por elegirnos.",
        );

      if (bonus.status === CONFIG.SD.BONUS_STATUS.ASSIGNED)
        throw new ForbiddenError("Has un deposito para acceder a tu bono.");

      return await tx.bonus.update({
        where: { id: bonusId },
        data: { status: CONFIG.SD.BONUS_STATUS.REDEEMED },
      });
    });
    return authorized;
  }
}
