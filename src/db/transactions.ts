import { PrismaClient } from "@prisma/client";
import { Transaction } from "@/types/response/transactions";

const prisma = new PrismaClient();

/**
 * Transaction History
 */
export class TransactionsDAO {
  static async create(data: Transaction) {
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
