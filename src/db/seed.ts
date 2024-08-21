import { Player, PrismaClient, UserRoot } from "@prisma/client";
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

  await prisma.userRoot.create({
    data: {
      username: casinoUsername,
      password: encrypt(casinoPassword),
      access: "",
      refresh: "",
      json_response: "",
      panel_id: -1,
    },
  });
}

async function updateUserRoot(userRoot: UserRoot) {
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

  await prisma.userRoot.update({
    where: { id: userRoot.id },
    data: {
      username: casinoUsername,
      password: encrypt(casinoPassword),
    },
  });
}

async function upsertUserRoot() {
  const userRoot = await prisma.userRoot.findFirst();
  if (!userRoot) {
    await createUserRoot();
  } else {
    const update = readlineSync.question(
      "User root ya existe, actualizar? [Y/n]",
      {
        defaultInput: "y",
      },
    );
    if (update.toLowerCase() === "y") await updateUserRoot(userRoot);
  }

  const casinoTokenService = new CasinoTokenService();
  await casinoTokenService.login();

  console.log("\nUser root OK 👍\n");
}

async function createAgent(userRoot: UserRoot) {
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
      panel_id: userRoot.panel_id,
      roles: {
        connectOrCreate: {
          where: { name: CONFIG.ROLES.AGENT },
          create: { name: CONFIG.ROLES.AGENT },
        },
      },
      email: "agent@example.com",
    },
  });
}

async function updateAgent(agent: Player) {
  const userRoot = await prisma.userRoot.findFirst();
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
      panel_id: userRoot!.panel_id,
    },
  });
}

async function upsertAgent() {
  const userRoot = await prisma.userRoot.findFirst();

  const agent = await prisma.player.findFirst({
    where: { roles: { some: { name: CONFIG.ROLES.AGENT } } },
  });

  if (!agent) {
    await createAgent(userRoot!);
  } else {
    const update = readlineSync.question(
      "Las credenciales del agente ya existen, actualizar? [Y/n]",
      {
        defaultInput: "y",
      },
    );
    if (update.toLowerCase() === "y") await updateAgent(agent);
  }

  console.log("\nAgente OK 👍\n");
}
async function main() {
  await ensureRolesExist();

  await upsertUserRoot();

  await upsertAgent();
}

main();
