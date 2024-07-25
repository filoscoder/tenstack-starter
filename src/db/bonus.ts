import { Bonus, Player, PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { hidePassword } from "@/utils/auth";
import CONFIG from "@/config";
import { OrderBy } from "@/types/request/players";
import { BonusUpdatableProps, CreateBonusProps } from "@/types/request/bonus";
import { RoledPlayer } from "@/types/response/players";

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

  static async count() {
    return prisma.bonus.count();
  }

  /**
   * Create a DB entry for a deposit
   */
  static async create(
    data: CreateBonusProps,
  ): Promise<Bonus & { Player: Player }> {
    try {
      const bonus = await prisma.bonus.create({
        data: {
          ...data,
          status: data.status ?? CONFIG.SD.BONUS_STATUS.ASSIGNED,
        },
        include: { Player: true },
      });
      bonus.Player = hidePassword(bonus.Player);
      return bonus;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  // static async index(all = true) {
  //   try {
  //     const bonus = await prisma.bonus.findMany({
  //       where: all
  //         ? {}
  //         : {
  //             OR: [
  //               { status: CONFIG.SD.BONUS_STATUS.ASSIGNED },
  //               { status: CONFIG.SD.BONUS_STATUS.PENDING },
  //             ],
  //           },
  //       include: { Player: true },
  //     });

  //     bonus.forEach(
  //       (deposit) => (deposit.Player = hidePassword(deposit.Player)),
  //     );
  //     return bonus;
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  // static async getById(id: string): Promise<Bonus | null> {
  //   try {
  //     const deposit = await prisma.bonus.findUnique({
  //       where: { id },
  //       include: { Player: true },
  //     });
  //     if (!deposit) return null;
  //     deposit.Player = hidePassword(deposit.Player);
  //     return deposit;
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  // static getByTrackingNumber(tracking_number: string) {
  //   try {
  //     return prisma.bonus.findUnique({
  //       where: { tracking_number },
  //     });
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  // static getPending(player_id: string) {
  //   try {
  //     return prisma.bonus.findMany({
  //       where: {
  //         player_id,
  //         AND: {
  //           OR: [
  //             { status: CONFIG.SD.DEPOSIT_STATUS.PENDING },
  //             { status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED },
  //           ],
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  /**
   * Get deposits where the money has been confirmed to have arrived at
   * Alquimia but coins haven't been transfered yet.
   */
  // static getPendingCoinTransfers() {
  //   try {
  //     return prisma.bonus.findMany({
  //       where: {
  //         status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED,
  //       },
  //       include: { Player: { include: { roles: true } } },
  //     });
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  static async update(
    id: string,
    data: BonusUpdatableProps,
  ): Promise<Bonus & { Player: Player }> {
    try {
      const bonus = await prisma.bonus.update({
        where: { id },
        data,
        include: { Player: true },
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

  /**
   * Checks if:
   *  - deposit exists
   *  - user has role of agent
   *  - deposit is not completed or deleted
   *  - deposit is not being confirmed (dirty)
   *
   * If checks pass, sets dirty flag to true (deposit is being confirmed)
   * @throws if checks fail
   */
  // static async authorizeUpdate(
  //   deposit_id: string,
  //   agent: Player & { roles: Role[] },
  // ) {
  //   const authorized = await prisma.$transaction(async (tx) => {
  //     const deposit = await tx.deposit.findFirst({ where: { id: deposit_id } });
  //     if (!deposit) throw new NotFoundException();

  //     if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.COMPLETED)
  //       throw new ForbiddenError("El deposito ya está completado");

  //     if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.DELETED)
  //       throw new ForbiddenError("No se pueden modificar depositos eliminados");

  //     if (deposit.dirty)
  //       throw new ForbiddenError("El deposito está siendo procesado");

  //     if (!agent.roles.some((r) => r.name === CONFIG.ROLES.AGENT))
  //       throw new ForbiddenError("No autorizado");

  //     return await tx.deposit.update({
  //       where: { id: deposit_id },
  //       data: { dirty: true },
  //     });
  //   });
  //   return authorized;
  // }
}
