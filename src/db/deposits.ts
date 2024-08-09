import { Deposit, Player, Prisma, PrismaClient, Role } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DepositRequest } from "@/types/request/transfers";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { hidePassword } from "@/utils/auth";
import CONFIG, { DEPOSIT_STATUS } from "@/config";
import { OrderBy } from "@/types/request/players";

const prisma = new PrismaClient();

export class DepositsDAO {
  static _getAll = async (
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Deposit>,
  ): Promise<Deposit[]> => {
    try {
      const deposits = await prisma.deposit.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
        where: {
          OR: [
            { tracking_number: { contains: search } },
            { Player: { username: { contains: search } } },
            { Player: { first_name: { contains: search } } },
            { Player: { last_name: { contains: search } } },
          ],
        },
        orderBy,
        include: { Player: true },
      });
      return deposits;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static async _getById(id: string) {
    try {
      return await prisma.deposit.findUnique({
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
    return prisma.deposit.count();
  }

  /**
   * Create a DB entry for a deposit
   */
  static async create(data: {
    select?: Prisma.DepositSelect<DefaultArgs> | null | undefined;
    include?: Prisma.DepositInclude<DefaultArgs> | null | undefined;
    data: Prisma.XOR<
      Prisma.DepositCreateInput,
      Prisma.DepositUncheckedCreateInput
    >;
  }) {
    try {
      return await prisma.deposit.create(data);
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async index(all = true) {
    try {
      const deposits = await prisma.deposit.findMany({
        where: all
          ? {}
          : {
              OR: [
                { status: DEPOSIT_STATUS.PENDING },
                { status: DEPOSIT_STATUS.VERIFIED },
              ],
            },
        include: { Player: true },
      });

      deposits.forEach(
        (deposit) => (deposit.Player = hidePassword(deposit.Player)),
      );
      return deposits;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async getById(id: string): Promise<Deposit | null> {
    try {
      const deposit = await prisma.deposit.findUnique({
        where: { id },
        include: { Player: true },
      });
      if (!deposit) return null;
      deposit.Player = hidePassword(deposit.Player);
      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static getByTrackingNumber(tracking_number: string) {
    try {
      return prisma.deposit.findUnique({
        where: { tracking_number },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static getPending(player_id: string) {
    try {
      return prisma.deposit.findMany({
        where: {
          player_id,
          AND: {
            OR: [
              { status: DEPOSIT_STATUS.PENDING },
              { status: DEPOSIT_STATUS.UNVERIFIED },
            ],
          },
        },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  //TODO
  // delete
  /**
   * Get deposits where the money has been confirmed to have arrived at
   * Alquimia but coins haven't been transfered yet.
   */
  // static getPendingCoinTransfers() {
  //   try {
  //     return prisma.deposit.findMany({
  //       where: {
  //         status: DEPOSIT_STATUS.VERIFIED,
  //       },
  //       include: { Player: { include: { roles: true } } },
  //     });
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  static async update(data: {
    select?: Prisma.DepositSelect<DefaultArgs> | null | undefined;
    include?: Prisma.DepositInclude<DefaultArgs> | null | undefined;
    data: Prisma.XOR<
      Prisma.DepositUpdateInput,
      Prisma.DepositUncheckedUpdateInput
    >;
    where: Prisma.DepositWhereUniqueInput;
  }) {
    try {
      return await prisma.deposit.update(data);
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static delete(id: string) {
    try {
      return prisma.deposit.delete({ where: { id } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  // TODO
  /**
   * Ensures deposit exists and belongs to authed user or user is agent.
   * @throws if checks fail.
   */
  // static async authorizeTransaction(deposit_id: string, player: RoledPlayer) {
  //   try {
  //     const deposit = await this.getById(deposit_id);
  //     if (!deposit) throw new NotFoundException();

  //     if (
  //       deposit.player_id !== player.id &&
  //       !player.roles.some((r) => r.name === CONFIG.ROLES.AGENT)
  //     )
  //       throw new ForbiddenError("El depósito no le pertenece.");

  //     return deposit;
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  /**
   * Checks if:
   *  - deposit exists and belongs to player
   *  - deposit is not completed or deleted
   *  - deposit is not being confirmed (dirty)
   *  - another deposit with same tracking_number exists
   *
   * If checks pass, sets dirty flag to true (deposit is being confirmed)
   * @throws if checks fail
   */
  // static async authorizeUpdate(
  //   deposit_id: string,
  //   tracking_number: string,
  //   player: RoledPlayer,
  // ) {
  //   try {
  //     let deposit = await this.authorizeTransaction(deposit_id, player);
  //     if (deposit.status === DEPOSIT_STATUS.VERIFIED)
  //       throw new ForbiddenError(
  //         "No se pueden modificar depositos verificados",
  //       );
  //     if (deposit.status === DEPOSIT_STATUS.DELETED)
  //       throw new ForbiddenError("No se pueden modificar depositos eliminados");
  //     if (deposit.dirty)
  //       throw new ForbiddenError("El deposito esta siendo confirmado");

  //     const duplicate = await prisma.deposit.findFirst({
  //       where: {
  //         tracking_number,
  //         NOT: { id: deposit_id },
  //       },
  //     });
  //     if (duplicate)
  //       throw new ForbiddenError("Deposito ya acreditado previamente.");

  //     deposit = await prisma.deposit.update({
  //       where: { id: deposit_id },
  //       data: { dirty: true },
  //       include: { Player: true },
  //     });
  //     return deposit;
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     prisma.$disconnect();
  //   }
  // }

  static async authorizeCreation(request: DepositRequest) {
    try {
      const deposit = await prisma.deposit.findUnique({
        where: { tracking_number: request.tracking_number },
      });
      if (deposit)
        throw new ForbiddenError("Deposito ya acreditado previamente.");
      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  /**
   * Checks if:
   *  - deposit exists and
   *  - belongs to player or
   *  - user has role of agent.
   *  - deposit is not verified or deleted.
   *  - deposit is not being confirmed (dirty).
   *  - another deposit with same tracking_number exists.
   *
   * If checks pass, sets dirty flag to true (deposit is being confirmed)
   * @throws if checks fail
   */
  static async authorizeUpdate(
    deposit_id: string,
    user: Player & { roles: Role[] },
    tracking_number?: string,
  ) {
    await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findFirst({ where: { id: deposit_id } });
      if (!deposit) throw new NotFoundException("Deposit not found");

      if (deposit.status === DEPOSIT_STATUS.VERIFIED)
        throw new ForbiddenError("El deposito ya está verificado");

      if (deposit.status === DEPOSIT_STATUS.DELETED)
        throw new ForbiddenError("No se pueden modificar depositos eliminados");

      if (deposit.dirty)
        throw new ForbiddenError("El deposito está siendo procesado");

      if (
        deposit.player_id !== user.id &&
        !user.roles.some((r) => r.name === CONFIG.ROLES.AGENT)
      )
        throw new ForbiddenError("El depósito no le pertenece.");

      const duplicate = await tx.deposit.findFirst({
        where: {
          tracking_number,
          NOT: { id: deposit_id },
        },
      });
      if (tracking_number && duplicate)
        throw new ForbiddenError("Deposito ya acreditado previamente.");

      await tx.deposit.update({
        where: { id: deposit_id },
        data: { dirty: true },
      });
    });
  }
}
