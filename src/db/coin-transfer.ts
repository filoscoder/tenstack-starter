import { PrismaClient } from "@prisma/client";
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
}
