import { PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { Transaction } from "@/types/response/transactions";

const prisma = new PrismaClient();

/**
 * Transaction History
 */
export class TransactionsDAO {
  /**
   * Ensure bank account exists and belongs to authenticated player
   * @param bank_account
   * @param player_id
   */
  static async authorizeTransaction(bank_account: number, player_id: number) {
    try {
      const account = await prisma.bankAccount.findFirst({
        where: { id: bank_account },
      });

      if (!account) throw new NotFoundException();

      if (account.player_id !== player_id)
        throw new ForbiddenError("No autorizado");
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async logTransaction(data: Transaction) {
    try {
      const transaction = await prisma.transactions.create({ data });

      return transaction;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
