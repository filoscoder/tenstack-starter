import { PrismaClient } from "@prisma/client";

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

interface PaymentRequest {
  player_id: number;
  bank_account: number;
  amount: number;
}
