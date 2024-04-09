import { PrismaClient } from "@prisma/client";
import { BankAccountRequest } from "@/types/request/bank-account";
import { ForbiddenError, NotFoundException } from "@/helpers/error";

const prisma = new PrismaClient();

export class BankAccountsDAO {
  static async index(player_id: string) {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: { player_id },
      });
      return accounts;
    } catch (error: any) {
      // Prisma errors handled by prismaErrorHandler()
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async show(account_id: string, player_id: string) {
    try {
      await this.authorizeView(account_id, player_id);

      const account = await prisma.bankAccount.findUnique({
        where: { id: account_id },
      });
      return account;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async create(player_id: string, request: BankAccountRequest) {
    try {
      const account = await prisma.bankAccount.create({
        data: { player_id, ...request },
      });
      return account;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async update(
    account_id: string,
    player_id: string,
    request: BankAccountRequest,
  ) {
    try {
      await this.authorizeUpdate(account_id, player_id);

      const updated = await prisma.bankAccount.update({
        where: { id: account_id, player_id },
        data: request,
      });
      return updated;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async delete(account_id: string, player_id: string) {
    try {
      await this.authorizeDelete(account_id, player_id);

      await prisma.bankAccount.delete({ where: { id: account_id } });
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async authorizeUpdate(account_id: string, player_id: string) {
    const account = await prisma.bankAccount.findUnique({
      where: { id: account_id },
    });

    if (!account) throw new NotFoundException();

    if (account.player_id !== player_id)
      throw new ForbiddenError("No autorizado");
  }

  static authorizeDelete = this.authorizeUpdate;

  static authorizeView = this.authorizeUpdate;
}
