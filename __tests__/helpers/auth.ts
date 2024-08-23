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
      Cashier: {
        connectOrCreate: {
          where: {
            username: "Cashier33",
          },
          create: {
            panel_id: -42,
            access: "",
            refresh: "",
            username: "Cashier33",
            password: "",
            handle: "@Cashier33",
          },
        },
      },
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

  const cashier_id = (await users[CONFIG.ROLES.CASHIER]).cashier_id;
  let deleteCashier;
  if (cashier_id)
    deleteCashier = testPrisma.cashier
      .delete({
        where: { id: cashier_id },
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});

  return Promise.all([...deletePlayers, deleteCashier]);
}
