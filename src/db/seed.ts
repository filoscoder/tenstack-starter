import { PrismaClient } from "@prisma/client";
import readlineSync from "readline-sync";
import CONFIG from "@/config";
import { encrypt, hash } from "@/utils/crypt";

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
  const localUsername = readlineSync.question(
    "Usuario del agente en panel propio [agente]: ",
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
      panel_id: -1,
      roles: {
        connectOrCreate: {
          where: { name: CONFIG.ROLES.AGENT },
          create: { name: CONFIG.ROLES.AGENT },
        },
      },
    },
  });

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

  console.log("Agente creado 👍");
  console.log();
}

main();
