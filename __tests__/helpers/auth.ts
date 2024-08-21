import { testPrisma } from ".";
import { AuthServices } from "@/components/auth/services";
import CONFIG from "@/config";

const users = {
  [CONFIG.ROLES.AGENT]: testPrisma.player.create({
    data: {
      email: "userWithAgentRole31@example.com",
      password: "1234",
      panel_id: -31,
      username: "userWithAgentRole31",
      roles: {
        connect: {
          name: CONFIG.ROLES.AGENT,
        },
      },
    },
    include: {
      roles: true,
    },
  }),
  [CONFIG.ROLES.PLAYER]: testPrisma.player.create({
    data: {
      email: "userWithPlayerRole32@example.com",
      password: "1234",
      panel_id: -32,
      username: "userWithPlayerRole32",
      roles: {
        connect: {
          name: CONFIG.ROLES.PLAYER,
        },
      },
    },
    include: {
      roles: true,
    },
  }),
  [CONFIG.ROLES.CASHIER]: testPrisma.player.create({
    data: {
      email: "userWithCashierRole33@example.com",
      password: "1234",
      panel_id: -33,
      username: "userWithCashierRole33",
      roles: {
        connect: [
          { name: CONFIG.ROLES.CASHIER },
          { name: CONFIG.ROLES.PLAYER },
        ],
      },
      Cashier: { create: { commission: 0.1, balance: 10 } },
    },
    include: {
      roles: true,
      Cashier: true,
    },
  }),
};

export async function generateAccessToken(type: string) {
  const authServices = new AuthServices();
  // @ts-ignore
  const user = await users[type];

  const {
    tokens: { access: token },
  } = await authServices.tokens(user.id, "jest_test");

  return { token, user, cleanUp };
}

async function cleanUp() {
  const deletePlayers = Object.values(users).map(async (u) =>
    testPrisma.player.delete({ where: { id: (await u).id } }),
  );

  return Promise.all(deletePlayers);
}
