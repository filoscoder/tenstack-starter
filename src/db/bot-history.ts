import { BotHistory } from "@prisma/client";
import { prisma } from "@/prisma";
import { OrderBy } from "@/types/request/players";

export class BotHistoryDAO {
  static count() {
    return prisma.botHistory.count();
  }
  static _getAll(
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<BotHistory>,
  ): Promise<BotHistory[]> {
    return prisma.botHistory.findMany({
      skip: page * itemsPerPage,
      take: itemsPerPage,
      where: {
        OR: [{ from: { contains: search } }, { answer: { contains: search } }],
      },
      orderBy,
      //   include: { Player: true, CoinTransfer: { select: { status: true } } },
    });
  }

  static _getById(id: string): Promise<BotHistory | null> {
    return prisma.botHistory.findFirst({ where: { id } });
  }
}
