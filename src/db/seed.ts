import { PrismaClient } from "@prisma/client";
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

/**
 * Ensure user roles exists, create if not.
 * Create
 */
const prisma = new PrismaClient();

async function main() {
  async function ensureRolesExist() {
    const roles = await prisma.role.findMany();
    if (roles.length === 0) {
      await prisma.role.createMany({
        data: [{ name: CONFIG.ROLES.AGENT }, { name: CONFIG.ROLES.PLAYER }],
      });
    }
  }

  await ensureRolesExist();

  let userRoot = await prisma.userRoot.findFirst();
  if (!userRoot) {
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

  const casinoTokenService = new CasinoTokenService();
  await casinoTokenService.login();

  userRoot = await prisma.userRoot.findFirst();

  const agent = await prisma.player.findFirst({
    where: { roles: { some: { name: CONFIG.ROLES.AGENT } } },
  });

  if (!agent) {
    const localUsername = readlineSync.question(
      "Usuario del agente en panel propio [cmex-admin]: ",
      {
        defaultInput: "agente",
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
        panel_id: userRoot!.panel_id,
        roles: {
          connectOrCreate: {
            where: { name: CONFIG.ROLES.AGENT },
            create: { name: CONFIG.ROLES.AGENT },
          },
        },
      },
    });
  }

  console.log("\nAgente OK 👍\n");

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

main();
