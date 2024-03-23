import { Deposit, PrismaClient } from "@prisma/client";
import {
  DepositRequest,
  DepositUpdatableProps,
} from "@/types/request/transfers";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { hidePassword } from "@/utils/auth";

const prisma = new PrismaClient();

export class DepositsDAO {
  /**
   * Create a DB entry for a deposit
   */
  static create(data: DepositRequest): Promise<Deposit> {
    try {
      return prisma.deposit.create({ data, include: { Player: true } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async index(all = true) {
    try {
      const deposits = await prisma.deposit.findMany({
        where: all ? {} : { confirmed: null },
        include: { Player: true, BankAccount: true },
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

  static getById(id: number) {
    try {
      return prisma.deposit.findUnique({
        where: { id },
        include: { Player: true },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static getPending(player_id: number) {
    try {
      return prisma.deposit.findMany({ where: { player_id, confirmed: null } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static getPendingCoinTransfers() {
    try {
      return prisma.deposit.findMany({
        where: { coins_transfered: null },
        include: { Player: true, BankAccount: true },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static update(id: number, data: DepositUpdatableProps) {
    try {
      return prisma.deposit.update({ where: { id }, data });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static delete(id: number) {
    try {
      return prisma.deposit.delete({ where: { id } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  /**
   * Ensures deposit exists and belongs to player.
   * @throws if checks fail.
   */
  static async authorizeTransaction(deposit_id: number, player_id: number) {
    try {
      const deposit = await this.getById(deposit_id);
      if (!deposit) throw new NotFoundException();

      if (deposit.player_id !== player_id)
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
   *  - deposit is not already confirmed
   *  - deposit is not being confirmed
   *
   * If checks pass, sets dirty flag to true (deposit is being confirmed)
   * @throws if checks fail
   */
  static async authorizeConfirmation(deposit_id: number, player_id: number) {
    try {
      let deposit = await this.authorizeTransaction(deposit_id, player_id);
      if (deposit.confirmed)
        throw new ForbiddenError(
          "No se pueden modificar depositos confirmados",
        );
      if (deposit.dirty)
        throw new ForbiddenError("El deposito esta siendo confirmado");

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

  static authorizeDeletion = this.authorizeConfirmation;
}
