import { BotFlow, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BotFlowsDAO {
  static async findOnCallFlow(): Promise<BotFlow | null> {
    try {
      return await prisma.botFlow.findFirst({
        where: { on_call: true, active: true },
      });
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }
  static async setOnCall(active: boolean): Promise<void> {
    try {
      await prisma.botFlow.updateMany({
        where: { on_call: true },
        data: { active },
      });
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }
}
