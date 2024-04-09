import { Deposit, Player, PrismaClient } from "@prisma/client";
import {
  CreateDepositProps,
  DepositRequest,
  DepositUpdatableProps,
} from "@/types/request/transfers";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { hidePassword } from "@/utils/auth";
import CONFIG from "@/config";
import { RoledPlayer } from "@/types/response/players";
import { ERR } from "@/config/errors";
import { CustomError } from "@/middlewares/errorHandler";

const prisma = new PrismaClient();

export class DepositsDAO {
  /**
   * Create a DB entry for a deposit
   */
  static async create(
    data: CreateDepositProps,
  ): Promise<Deposit & { Player: Player }> {
    try {
      const deposit = await prisma.deposit.create({
        data: { ...data, status: CONFIG.SD.DEPOSIT_STATUS.PENDING },
        include: { Player: true },
      });
      deposit.Player = hidePassword(deposit.Player);
      return deposit;
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
                { status: CONFIG.SD.DEPOSIT_STATUS.PENDING },
                { status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED },
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

  // TODO test
  static getPending(player_id: string) {
    try {
      return prisma.deposit.findMany({
        where: {
          player_id,
          AND: {
            OR: [
              { status: CONFIG.SD.DEPOSIT_STATUS.PENDING },
              { status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED },
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

  /**
   * Get deposits where the money has been confirmed to have arrived at
   * Alquimia but coins haven't been transfered yet.
   */
  static getPendingCoinTransfers() {
    try {
      return prisma.deposit.findMany({
        where: {
          status: CONFIG.SD.DEPOSIT_STATUS.VERIFIED,
        },
        include: { Player: { include: { roles: true } } },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async update(
    id: string,
    data: DepositUpdatableProps,
  ): Promise<Deposit & { Player: Player }> {
    try {
      const deposit = await prisma.deposit.update({
        where: { id },
        data,
        include: { Player: true },
      });
      return deposit;
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

  /**
   * Ensures deposit exists and belongs to authed user or user is agent.
   * @throws if checks fail.
   */
  static async authorizeTransaction(deposit_id: string, player: RoledPlayer) {
    try {
      const deposit = await this.getById(deposit_id);
      if (!deposit) throw new NotFoundException();

      if (
        deposit.player_id !== player.id &&
        !player.roles.some((r) => r.name === CONFIG.ROLES.AGENT)
      )
        throw new ForbiddenError("No autorizado");

      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

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
  static async authorizeConfirmation(
    deposit_id: string,
    tracking_number: string,
    player: RoledPlayer,
  ) {
    try {
      let deposit = await this.authorizeTransaction(deposit_id, player);
      if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.COMPLETED)
        throw new ForbiddenError(
          "No se pueden modificar depositos completados",
        );
      if (deposit.status === CONFIG.SD.DEPOSIT_STATUS.DELETED)
        throw new ForbiddenError("No se pueden modificar depositos eliminados");
      if (deposit.dirty)
        throw new ForbiddenError("El deposito esta siendo confirmado");

      const duplicate = await prisma.deposit.findFirst({
        where: {
          tracking_number,
          NOT: { id: deposit_id },
        },
      });
      if (duplicate) throw new CustomError(ERR.DEPOSIT_ALREADY_EXISTS);

      deposit = await prisma.deposit.update({
        where: { id: deposit_id },
        data: { dirty: true },
        include: { Player: true },
      });
      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  // static authorizeDeletion = this.authorizeConfirmation;

  static async authorizeCreation(request: DepositRequest) {
    try {
      const deposit = await prisma.deposit.findUnique({
        where: { tracking_number: request.tracking_number },
      });
      if (deposit) throw new ForbiddenError("already exists");
      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
