import { PrismaClient } from "@prisma/client";
import { CreateTokenDetails, TokenUpdatableProps } from "@/types/request/token";

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

  static async update(id: string, data: TokenUpdatableProps) {
    try {
      const token = await prisma.token.update({ where: { id }, data });
      return token;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
