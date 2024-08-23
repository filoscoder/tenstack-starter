import { Cashier, Player, PrismaClient } from "@prisma/client";
import readlineSync from "readline-sync";
import CONFIG from "@/config";
import { encrypt, hash } from "@/utils/crypt";
import { CasinoTokenService } from "@/services/casino-token.service";

const prisma = new PrismaClient();

async function ensureRolesExist() {
  const roles = Object.values(CONFIG.ROLES);
  const dbRoles = await prisma.role.findMany();
  if (dbRoles.length === 0) {
    await prisma.role.createMany({
      data: roles.map((role) => ({ name: role })),
    });
  } else {
    roles.forEach(async (role) => {
      if (dbRoles.some((r) => r.name === role)) return;

      await prisma.role.create({ data: { name: role } });
    });
  }

  console.log("\nRoles OK 👍\n");
}

async function createUserRoot() {
  const casinoUsername = readlineSync.question(
    `Nombre de usuario del agente en el casino [${CONFIG.AUTH.CASINO_PANEL_USER}]:`,
    {
      defaultInput: `${CONFIG.AUTH.CASINO_PANEL_USER}`,
    },
  );
  const casinoPassword = readlineSync.question(
    `Contraseña del agente en el casino: [${CONFIG.AUTH.CASINO_PANEL_PASS}]:`,
    {
      defaultInput: `${CONFIG.AUTH.CASINO_PANEL_PASS}`,
      hideEchoBack: true,
    },
  );

  return await prisma.cashier.create({
    data: {
      username: casinoUsername,
      password: encrypt(casinoPassword),
      access: "",
      refresh: "",
      panel_id: -1,
    },
  });
}

async function updateUserRoot(userRoot: Cashier) {
  const casinoUsername = readlineSync.question(
    `Nombre de usuario del agente en el casino [${CONFIG.AUTH.CASINO_PANEL_USER}]:`,
    {
      defaultInput: `${CONFIG.AUTH.CASINO_PANEL_USER}`,
    },
  );
  const casinoPassword = readlineSync.question(
    `Contraseña del agente en el casino: [${CONFIG.AUTH.CASINO_PANEL_PASS}]:`,
    {
      defaultInput: `${CONFIG.AUTH.CASINO_PANEL_PASS}`,
      hideEchoBack: true,
    },
  );

  return await prisma.cashier.update({
    where: { id: userRoot.id },
    data: {
      username: casinoUsername,
      password: encrypt(casinoPassword),
    },
  });
}

async function upsertUserRoot(): Promise<Cashier> {
  const agent = await prisma.player.findFirst({
    where: { roles: { every: { name: CONFIG.ROLES.AGENT } } },
    select: { Cashier: true },
  });
  let userRoot = agent?.Cashier;
  if (!userRoot) {
    userRoot = await createUserRoot();
  } else {
    const update = readlineSync.question(
      "User root ya existe, actualizar? [Y/n]",
      {
        defaultInput: "y",
      },
    );
    if (update.toLowerCase() === "y") userRoot = await updateUserRoot(userRoot);
  }

  const casinoTokenService = new CasinoTokenService(userRoot);
  await casinoTokenService.login();

  console.log("\nUser root OK 👍\n");
  return userRoot;
}

async function createAgent(userRoot: Cashier) {
  const localUsername = readlineSync.question(
    "Usuario del agente en panel propio [cmex-admin]: ",
    {
      defaultInput: "cmex-admin",
    },
  );
  const localPassword = readlineSync.question(
    "Contraseña del agente en panel propio: ",
    {
      hideEchoBack: true,
    },
  );

  await prisma.player.create({
    data: {
      username: localUsername,
      password: await hash(localPassword),
      panel_id: userRoot.panel_id!,
      roles: {
        connectOrCreate: {
          where: { name: CONFIG.ROLES.AGENT },
          create: { name: CONFIG.ROLES.AGENT },
        },
      },
      email: "agent@example.com",
      cashier_id: userRoot.id,
    },
  });
}

async function updateAgent(agent: Player, userRoot: Cashier) {
  const localUsername = readlineSync.question(
    "Usuario del agente en panel propio [cmex-admin]: ",
    {
      defaultInput: "cmex-admin",
    },
  );
  const localPassword = readlineSync.question(
    "Contraseña del agente en panel propio: ",
    {
      hideEchoBack: true,
    },
  );

  await prisma.player.update({
    where: { id: agent.id },
    data: {
      username: localUsername,
      password: await hash(localPassword),
      panel_id: userRoot.panel_id!,
      cashier_id: userRoot.id,
    },
  });
}

async function upsertAgent(userRoot: Cashier) {
  const agent = await prisma.player.findFirst({
    where: { roles: { some: { name: CONFIG.ROLES.AGENT } } },
  });

  if (!agent) {
    await createAgent(userRoot);
  } else {
    await prisma.player.update({
      where: { id: agent.id },
      data: { cashier_id: userRoot.id },
    });
    const update = readlineSync.question(
      "Las credenciales del agente ya existen, actualizar? [Y/n]",
      {
        defaultInput: "y",
      },
    );
    if (update.toLowerCase() === "y") await updateAgent(agent, userRoot);
  }

  console.log("\nAgente OK 👍\n");
}
async function main() {
  await ensureRolesExist();

  const userRoot: Cashier = await upsertUserRoot();

  await upsertAgent(userRoot);
}

main();
