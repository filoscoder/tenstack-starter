import { PrismaClient } from "@prisma/client";
import {
  CreateTokenDetails,
  TokenLookUpBy,
  TokenUpdatableProps,
} from "@/types/request/token";
import { ForbiddenError, NotFoundException } from "@/helpers/error";

const prisma = new PrismaClient();

export class TokenDAO {
  static async create(data: CreateTokenDetails) {
    const dayInMS = 24 * 60 * 60 * 1000;
    try {
      await prisma.token.deleteMany({
        where: { created_at: { lt: new Date(Date.now() - dayInMS * 15) } },
      });
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

  static async authorizeRevocation(user_id: string, jti: string) {
    try {
      const token = await this.getById(jti);
      if (!token) throw new NotFoundException();
      if (token.player_id !== user_id) {
        throw new ForbiddenError("No autorizado");
      }
      return token;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
