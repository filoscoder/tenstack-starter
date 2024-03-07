import { PrismaClient } from "@prisma/client";
import {
  CreateTokenDetails,
  TokenLookUpBy,
  TokenUpdatableProps,
} from "@/types/request/token";

const prisma = new PrismaClient();

export class TokenDAO {
  static async create(data: CreateTokenDetails) {
    try {
      const token = await prisma.token.create({ data });
      return token;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
  static async getById(id: string) {
    try {
      const token = await prisma.token.findUnique({ where: { id } });
      return token;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async updateById(id: string, data: TokenUpdatableProps) {
    try {
      const token = await prisma.token.update({ where: { id }, data });
      return token;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async update(where: TokenLookUpBy, data: TokenUpdatableProps) {
    try {
      await prisma.token.updateMany({ where, data });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
