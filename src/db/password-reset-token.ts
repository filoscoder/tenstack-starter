import { PasswordResetToken, PrismaClient } from "@prisma/client";
import { PasswordResetTokenCreate } from "@/types/request/pass-restore";

const prisma = new PrismaClient();

export class PasswordResetTokenDAO {
  static async create(data: PasswordResetTokenCreate) {
    try {
      return await prisma.passwordResetToken.create({ data });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    try {
      return await prisma.passwordResetToken.findFirst({ where: { token } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async delete(id: string) {
    try {
      await prisma.passwordResetToken.delete({ where: { id } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
