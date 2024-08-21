import { OK, UNAUTHORIZED, FORBIDDEN } from "http-status";
import { SuperAgentTest } from "supertest";
import { Player, PrismaClient } from "@prisma/client";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { AuthServices } from "@/components/auth/services";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let player: Player;
let userWithAgentRole: Player;
let playerAccessToken: string;
let agentAccessToken: string;

beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => COIN TRANSFER ROUTER", () => {
  describe("GET: /coin-transfer/pending-total", () => {
    it("Should return pending coin transfers", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/coin-transfer/pending-total`)
        .set("Authorization", `Bearer ${agentAccessToken}`);
      expect(response.status).toBe(OK);
      expect(response.body.data).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/coin-transfer/pending-total`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /coin-transfer/release-pending", () => {
    it("Should return completed deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/coin-transfer/release-pending`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/coin-transfer/release-pending`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/coin-transfer/release-pending`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });
});

async function initialize() {
  prisma = new PrismaClient();

  const credentials = {
    username: "jest_test" + Date.now(),
    password: "1234",
    email: "jest_test" + Date.now() + "@test.com",
  };
  agent = await initAgent();
  player = await prisma.player.create({
    data: {
      ...credentials,
      panel_id: -10,
    },
  });

  userWithAgentRole = await prisma.player.create({
    data: {
      email: "userWithAgentRole13@example.com",
      password: "1234",
      panel_id: -13,
      username: "userWithAgentRole13",
      roles: {
        connect: {
          name: "agent",
        },
      },
    },
    include: {
      roles: true,
    },
  });
  const authServices = new AuthServices();
  const { tokens: playerTokens } = await authServices.tokens(
    player.id,
    "jest_test",
  );
  const { tokens: agentTokens } = await authServices.tokens(
    userWithAgentRole.id,
    "jest_test",
  );
  playerAccessToken = playerTokens.access;
  agentAccessToken = agentTokens.access;
}

async function cleanUp() {
  await prisma.player.delete({
    where: {
      id: player.id,
    },
  });
  await prisma.player.delete({
    where: {
      id: userWithAgentRole.id,
    },
  });
}
