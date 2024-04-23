import { Player, PrismaClient, UserRoot } from "@prisma/client";
import readlineSync from "readline-sync";
import CONFIG from "@/config";
import { encrypt, hash } from "@/utils/crypt";
import { CasinoTokenService } from "@/services/casino-token.service";
import {
  botMenus,
  botMenusOnCall,
  botMessages,
  botMessagesOnCall,
} from "@/chatbot/messages";

const prisma = new PrismaClient();

async function ensureRolesExist() {
  const roles = await prisma.role.findMany();
  if (roles.length === 0) {
    await prisma.role.createMany({
      data: [{ name: CONFIG.ROLES.AGENT }, { name: CONFIG.ROLES.PLAYER }],
    });
  }
}

async function createUserRoot() {
  const casinoUsername = readlineSync.question(
    "Nombre de usuario del agente en el casino [Lucas2]: ",
    {
      defaultInput: "Lucas2",
    },
  );
  const casinoPassword = readlineSync.question(
    "Contraseña del agente en el casino: ",
    {
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
    "Nombre de usuario del agente en el casino [luquin]: ",
    {
      defaultInput: "luquin",
    },
  );
  const casinoPassword = readlineSync.question(
    "Contraseña del agente en el casino: ",
    {
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

async function createBotFlows() {
  const onCallFlow = await prisma.botFlow.findFirst({
    where: { on_call: true },
  });
  if (!onCallFlow)
    await prisma.botFlow.create({
      data: {
        messages: botMessagesOnCall,
        menus: botMenusOnCall,
        on_call: true,
        active: false,
      },
    });

  const regularFlow = await prisma.botFlow.findFirst({
    where: { on_call: false },
  });
  if (!regularFlow)
    await prisma.botFlow.create({
      data: {
        messages: botMessages,
        menus: botMenus,
        on_call: false,
        active: false,
      },
    });

  console.log("Bot flows OK 👍\n");
}

async function main() {
  await ensureRolesExist();

  await upsertUserRoot();

  await upsertAgent();

  await createBotFlows();
}

main();
