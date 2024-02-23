import { PrismaClient } from "@prisma/client";
import { PaymentRequest } from "@/types/request/transfers";

const prisma = new PrismaClient();

export class PaymentsDAO {
  /**
   * Create a DB entry for a deposit
   */
  static async create(data: PaymentRequest) {
    try {
      const deposit = await prisma.payment.create({ data });

      return deposit;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
