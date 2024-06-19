import { Player, PrismaClient } from "@prisma/client";
import { SuperAgentTest } from "supertest";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK, UNAUTHORIZED } from "http-status";
import { initAgent } from "./helpers";
import { AuthServices } from "@/components/auth/services";
import CONFIG from "@/config";
import { TokenPair } from "@/types/response/jwt";
import { WebPushSubscription } from "@/types/request/web-push";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let casinoAgent: Player;
let auth: TokenPair;
const pushSubscription: WebPushSubscription = {
  endpoint: "test_endpoint" + Date.now(),
  keys: {
    auth: "test_auth" + Date.now(),
    p256dh: "test_p256dh" + Date.now(),
  },
};
beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => WEB PUSH", () => {
  describe("GET: /web-push/pubkey", () => {
    it("Should return web push public key", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/web-push/pubkey`)
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeDefined();
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/web-push/pubkey`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("POST: /web-push/subscription", () => {
    it("Should create a new subscription", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/subscription`)
        .send(pushSubscription)
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(CREATED);
    });

    it("Should return 400 missing endpoint", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/subscription`)
        .send({ keys: pushSubscription.keys })
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("endpoint is required");
      expect(response.body.data[0].path).toBe("endpoint");
    });

    it("Should return 400 missing p256", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/subscription`)
        .send({
          endpoint: pushSubscription.endpoint,
          keys: { auth: pushSubscription.keys.auth },
        })
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("p256dh is required");
      expect(response.body.data[0].path).toBe("keys.p256dh");
    });

    it("Should return 400 missing auth", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/subscription`)
        .send({
          endpoint: pushSubscription.endpoint,
          keys: { p256dh: pushSubscription.keys.p256dh },
        })
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("auth is required");
      expect(response.body.data[0].path).toBe("keys.auth");
    });

    it("Should return 401", async () => {
      const response = await agent.post(
        `/app/${CONFIG.APP.VER}/web-push/subscription`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("POST: /web-push/delete", () => {
    it("Should delete a subscription", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/delete`)
        .send({ endpoint: pushSubscription.endpoint })
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(OK);
    });

    it("Shloud return 400 missing endpoint", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/delete`)
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("endpoint is required");
      expect(response.body.data[0].path).toBe("endpoint");
    });

    it("Should return 400 unknown fields", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/delete`)
        .send({ endpoint: pushSubscription.endpoint, unknown_field: "unknown" })
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/delete`)
        .send({ endpoint: pushSubscription.endpoint });

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 404", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/web-push/delete`)
        .send({ endpoint: "unknown_endpoint" })
        .set("Authorization", `Bearer ${auth.access}`);

      expect(response.status).toBe(NOT_FOUND);
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();

  casinoAgent = (await prisma.player.findFirst({
    where: { roles: { some: { name: CONFIG.ROLES.AGENT } } },
  })) as Player;

  if (!casinoAgent) throw new Error("Agent not found");

  const authServices = new AuthServices();
  const { tokens } = await authServices.tokens(casinoAgent.id);
  auth = tokens;
}

async function cleanUp() {
  await prisma.token.deleteMany({
    where: { player_id: casinoAgent.id },
  });
  prisma.$disconnect();
}
