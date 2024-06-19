import { PrismaClient, Player } from "@prisma/client";
import { OK, UNAUTHORIZED, FORBIDDEN } from "http-status";
import { SuperAgentTest } from "supertest";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { AuthServices } from "@/components/auth/services";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let player: Player;
let playerAccessToken: string;
let agentId: string;
let agentAccessToken: string;
let botNames: string[];

const credentials = {
  username: "jest_test" + Date.now(),
  password: "1234",
  email: "jest_test" + Date.now() + "@test.com",
};

beforeAll(initialize);

afterAll(cleanUp);
describe("[UNIT] => BOT ROUTER", () => {
  describe("GET: /bot/:name?", () => {
    it("Should return bot names", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bot`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      botNames = response.body.data;
    });

    it("Should return 200", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bot/${botNames[0]}`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(OK);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/bot`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bot`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();

  player = await prisma.player.create({
    data: {
      ...credentials,
      panel_id: -11,
    },
  });
  agentId = (await prisma.player.findFirst({
    where: {
      roles: {
        some: {
          name: "agent",
        },
      },
    },
  }))!.id;

  const authServices = new AuthServices();
  const { tokens: playerTokens } = await authServices.tokens(player.id);
  playerAccessToken = playerTokens.access;
  const { tokens: agentTokens } = await authServices.tokens(agentId);
  agentAccessToken = agentTokens.access;
}

async function cleanUp() {
  await prisma.token.deleteMany({ where: { player_id: player.id } });
  await prisma.token.deleteMany({ where: { player_id: agentId } });
  await prisma.player.delete({ where: { id: player.id } });
  prisma.$disconnect();
}
