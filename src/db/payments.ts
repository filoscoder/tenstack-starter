import { PrismaClient } from "@prisma/client";
import { PaymentRequest } from "@/types/request/transfers";
import { hidePassword } from "@/utils/auth";
import { PaymentUpdatableProps } from "@/types/request/transfers";

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

  /**
   * Show Payments
   */
  static async index(all = true) {
    try {
      const payments = await prisma.payment.findMany({
        where: all ? {} : { paid: null },
        include: { Player: true, BankAccount: true },
      });

      // Excluir contraseñas
      payments.forEach(
        (payment) => (payment.Player = hidePassword(payment.Player)),
      );
      return payments;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async update(id: number, data: PaymentUpdatableProps) {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data,
      });

      return payment;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
