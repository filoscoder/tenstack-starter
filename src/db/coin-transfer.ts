import { Prisma, PrismaClient } from "@prisma/client";
import CONFIG from "@/config";
import { CreateCoinTransferProps } from "@/types/services/coin-transfer";

const prisma = new PrismaClient();
export class CoinTransferDAO {
  static async create(props: CreateCoinTransferProps) {
    try {
      return await prisma.coinTransfer.create({
        data: {
          ...props,
          status: props.status ?? CONFIG.SD.COIN_TRANSFER_STATUS.PENDING,
        },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async findById(id: string) {
    try {
      return await prisma.coinTransfer.findUnique({
        where: { id },
        include: {
          Payment: { include: { Player: true } },
          Deposit: { include: { Player: true } },
          Bonus: { include: { Player: true } },
        },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async findMany(where: Prisma.CoinTransferWhereInput) {
    try {
      return await prisma.coinTransfer.findMany({ where });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async update(
    where: Prisma.CoinTransferWhereUniqueInput,
    data: Prisma.XOR<
      Prisma.CoinTransferUpdateInput,
      Prisma.CoinTransferUncheckedUpdateInput
    >,
  ) {
    try {
      return prisma.coinTransfer.update({ where, data });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
