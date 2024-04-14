import { PrismaClient } from "@prisma/client";
import { PaymentRequest } from "@/types/request/transfers";
import { hidePassword } from "@/utils/auth";
import { PaymentUpdatableProps } from "@/types/request/transfers";
import { NotFoundException, ForbiddenError } from "@/helpers/error";
import { CustomError } from "@/middlewares/errorHandler";
import CONFIG from "@/config";

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

  static async update(id: string, data: PaymentUpdatableProps) {
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
  /**
   * Ensure bank account exists and belongs to authenticated player
   * @param bank_account
   * @param player_id
   */
  static async authorizeCreation(bank_account: string, player_id: string) {
    try {
      const account = await prisma.bankAccount.findFirst({
        where: { id: bank_account },
      });

      if (!account) throw new NotFoundException();

      if (account.player_id !== player_id)
        throw new ForbiddenError("No autorizado");

      const dayInMs = 1000 * 60 * 60 * 24;
      const now = Date.now();

      const latestCashout = await prisma.payment.findFirst({
        where: {
          player_id: player_id,
          updated_at: { gte: new Date(Date.now() - dayInMs) },
        },
        orderBy: { updated_at: "desc" },
        take: 1,
      });

      if (!latestCashout || CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.DEV)
        return;

      const latestCashoutTime = latestCashout?.updated_at.getTime();
      const retryAfterMins = Math.ceil(
        (dayInMs - (now - latestCashoutTime)) / 1000 / 60,
      );
      throw new CustomError({
        status: 429,
        code: "too_many_requests",
        description:
          "Proximo retiro disponible en " +
          Math.floor(retryAfterMins / 60) +
          " horas " +
          (retryAfterMins % 60) +
          " minutos",
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
