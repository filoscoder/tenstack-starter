import { PrismaClient } from "@prisma/client";
import {
  AnalyticsCreateRequest,
  AnalyticsFindManyProps,
} from "@/types/request/analytics";

const prisma = new PrismaClient();

export class AnalyticsDAO {
  static async findMany(where?: AnalyticsFindManyProps) {
    try {
      return await prisma.analytics.findMany({ where });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async getById(id: string) {
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
