import { PrismaClient, Player } from "@prisma/client";
import { OK, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST } from "http-status";
import { SuperAgentTest } from "supertest";
import { initAgent } from "./helpers";
import CONFIG, { BLACKLIST_METHOD, GLOBAL_SWITCH_STATE } from "@/config";
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

  describe("POST: /bot/switch", () => {
    it("Should turn bot on", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/switch`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          state: GLOBAL_SWITCH_STATE.ON,
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeUndefined();
    });

    it("Should turn bot off", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/switch`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          state: GLOBAL_SWITCH_STATE.OFF,
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeUndefined();
    });

    it("Should return 400", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/switch`)
        .set("Authorization", `Bearer ${agentAccessToken}`)

        .send({
          state: GLOBAL_SWITCH_STATE.OFF,
          unknownField: "foo",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/switch`)
        .send({
          state: GLOBAL_SWITCH_STATE.OFF,
        });

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/switch`)
        .send({ active: true })
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /bot/switch", () => {
    it("Should return switch state", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bot/switch`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(OK);
      expect(
        Object.values(GLOBAL_SWITCH_STATE).includes(response.body.data),
      ).toBe(true);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/bot/switch`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bot/switch`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("POST: /bot/blacklist", () => {
    it("Should add number to blacklist", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/blacklist`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          number: "1112222333444",
          method: BLACKLIST_METHOD.ADD,
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeUndefined();
    });

    it("Should remove number from blacklist", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/blacklist`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          number: "1112222333444",
          method: BLACKLIST_METHOD.REMOVE,
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeUndefined();
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bot/blacklist`)
        .send({
          number: "1112222333444",
          method: BLACKLIST_METHOD.REMOVE,
        });

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /bot/blacklist", () => {
    it("Should return blacklist", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bot/blacklist`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/bot/blacklist`);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();

  player = await prisma.player.create({
    data: {
      ...credentials,
      panel_id: -12,
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
  const { tokens: playerTokens } = await authServices.tokens(
    player.id,
    "jest_test",
  );
  playerAccessToken = playerTokens.access;
  const { tokens: agentTokens } = await authServices.tokens(
    agentId,
    "jest_test",
  );
  agentAccessToken = agentTokens.access;
}

async function cleanUp() {
  await prisma.token.deleteMany({ where: { player_id: player.id } });
  await prisma.token.deleteMany({ where: { player_id: agentId } });
  await prisma.player.delete({ where: { id: player.id } });
  prisma.$disconnect();
}
