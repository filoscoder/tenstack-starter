import { Analytics, PrismaClient } from "@prisma/client";
import { AnalyticsCreateRequest } from "@/types/request/analytics";
import { OrderBy } from "@/types/request/players";

const prisma = new PrismaClient();

export class AnalyticsDAO {
  static get count() {
    try {
      return prisma.analytics.count();
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }
  static async _getAll(
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Analytics>,
  ) {
    try {
      return await prisma.analytics.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
        where: {
          AND: {
            OR: [
              { source: { contains: search } },
              { event: { contains: search } },
              { data: { string_contains: search } },
            ],
          },
        },
        orderBy,
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async _getById(id: string) {
    try {
      return await prisma.analytics.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async create(data: AnalyticsCreateRequest) {
    try {
      return await prisma.analytics.create({ data });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
