import { AgentConfig, PrismaClient } from "@prisma/client";
import { AgentBankAccount } from "@/types/response/agent";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";
import { RootUpdatableProps } from "@/types/request/user-root";

const prisma = new PrismaClient();

export class AgentConfigDAO {
  static async getBankAccount(): Promise<AgentBankAccount | undefined> {
    return (await prisma.agentConfig.findFirst())
      ?.bankAccount as AgentBankAccount;
  }

  static async getConfig(): Promise<AgentConfig | null> {
    return prisma.agentConfig.findFirst();
  }

  static async update(data: RootUpdatableProps) {
    const config = await this.getConfig();
    if (!config) throw new CustomError(ERR.AGENT_CONFIG_UNSET);
    return await prisma.agentConfig.update({ where: { id: config.id }, data });
  }
}
