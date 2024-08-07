import { BankAccount, Payment, Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { PaymentUpdatableProps } from "@/types/request/transfers";
import { NotFoundException, ForbiddenError } from "@/helpers/error";
import CONFIG from "@/config";
import { CustomError } from "@/helpers/error/CustomError";
import { OrderBy } from "@/types/request/players";

const prisma = new PrismaClient();

export class PaymentsDAO {
  /**
   * Create a DB entry for a deposit
   */
  static async create(data: {
    select?: Prisma.PaymentSelect<DefaultArgs> | null | undefined;
    include?: Prisma.PaymentInclude<DefaultArgs> | null | undefined;
    data: Prisma.XOR<
      Prisma.PaymentCreateInput,
      Prisma.PaymentUncheckedCreateInput
    >;
  }) {
    try {
      const deposit = await prisma.payment.create(data);

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
  static async _getAll(
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Payment>,
  ) {
    try {
      const payments = await prisma.payment.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
        where: {
          OR: [
            { BankAccount: { bankAlias: { contains: search } } },
            { BankAccount: { bankId: { contains: search } } },
            { BankAccount: { bankNumber: { contains: search } } },
            { BankAccount: { owner: { contains: search } } },
            { Player: { username: { contains: search } } },
            { Player: { first_name: { contains: search } } },
            { Player: { last_name: { contains: search } } },
          ],
        },
        orderBy,
        include: { Player: true, BankAccount: true },
      });

      return payments;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async _getById(id: string) {
    try {
      return await prisma.payment.findFirst({
        where: { id },
        include: { BankAccount: true },
      });
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
   * @throws NotFoundException
   * @throws ForbiddenError
   * @throws CustomError (too_many_requests)
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

      const latestCashoutTime = latestCashout?.created_at.getTime();
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

  static async authorizeRelease(
    payment_id: string,
  ): Promise<Payment & { BankAccount: BankAccount }> {
    const authorized = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { id: payment_id } });
      if (!payment) throw new NotFoundException();

      if (payment.status === CONFIG.SD.PAYMENT_STATUS.COMPLETED)
        throw new ForbiddenError("El pago ya está completado");

      if (payment.dirty)
        throw new ForbiddenError("El pago está siendo procesado");

      return await tx.payment.update({
        where: { id: payment_id },
        data: { dirty: true },
        include: { BankAccount: true },
      });
    });
    return authorized;
  }

  static count(): Promise<number> {
    return prisma.payment.count();
  }
}
