import { PrismaClient } from "@prisma/client";
import { RootUpdatableProps, RootRequest } from "@/types/request/user-root";
import { AgentBankAccount } from "@/types/response/agent";

const prisma = new PrismaClient();

export class UserRootDAO {
  static getAgent() {
    try {
      return prisma.userRoot.findFirst();
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static async getBankAccount(): Promise<AgentBankAccount> {
    try {
      const agent = await UserRootDAO.getAgent();
      return agent?.bankAccount as AgentBankAccount;
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static update(username: string, data: RootUpdatableProps) {
    try {
      return prisma.userRoot.update({
        where: { username: username },
        data,
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static upsert(
    username: string,
    update: RootUpdatableProps,
    create: RootRequest,
  ) {
    try {
      return prisma.userRoot.upsert({
        where: { username },
        update,
        create,
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}
