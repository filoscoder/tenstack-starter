import { BotHistory, Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { OrderBy } from "@/types/request/players";

export class BotHistoryDAO {
  static count(): Promise<{ count: number }[]> {
    return prisma.$queryRaw(Prisma.sql`
      SELECT COUNT(DISTINCT(\`from\`)) AS count FROM BOT_HISTORY`);
  }

  static _getAll(
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<BotHistory>,
  ): Promise<Pick<BotHistory, "id" | "from" | "answer" | "created_at">[]> {
    return prisma.botHistory.findMany({
      skip: page * itemsPerPage,
      take: itemsPerPage,
      where: {
        OR: [{ from: { contains: search } }, { answer: { contains: search } }],
      },
      orderBy,
      distinct: "from",
      select: { id: true, from: true, answer: true, created_at: true },
    });
  }

  static _getById(id: string): Promise<BotHistory | null> {
    return prisma.botHistory.findFirst({ where: { id } });
  }
}
