import { Cashier, PrismaClient } from "@prisma/client";
import CONFIG from "./config";
import { ERR } from "./config/errors";
import { CustomError } from "./helpers/error/CustomError";

const prismaClient = new PrismaClient();

export const prisma = prismaClient.$extends({
  model: {
    player: {
      async findAgent(): Promise<Cashier> {
        const user = await prismaClient.player.findFirst({
          where: { roles: { every: { name: CONFIG.ROLES.AGENT } } },
          select: { Cashier: true },
        });

        if (!user?.Cashier) throw new CustomError(ERR.AGENT_UNSET);

        return user.Cashier;
      },
    },
  },
});
