import { PrismaClient } from "@prisma/client";
import { DepositRequest } from "@/types/request/transfers";

const prisma = new PrismaClient();

export class DepositsDAO {
  /**
   * Create a DB entry for a deposit
   */
  static async create(data: DepositRequest) {
    try {
      const deposit = await prisma.deposit.create({ data });

      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
