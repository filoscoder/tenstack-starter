import { SuperAgentTest } from "supertest";
import { Player, PrismaClient } from "@prisma/client";
import { BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } from "http-status";
import jwt from "jsonwebtoken";
import { initAgent } from "./helpers";
import { TokenPair } from "@/types/response/jwt";
import { AuthServices } from "@/components/auth/services";
import CONFIG from "@/config";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let player: Player;
let player2: Player;
let tokenPair: TokenPair;
let tokenPair2: TokenPair;
let expired: string;
let refreshed: string;
const USER_AGENT = "jest_test";

const credentials = {
  username: "jest_test" + Date.now(),
  password: "1234",
  email: "jest_test" + Date.now() + "@test.com",
};

beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => AUTH", () => {
  describe("POST: /auth/refresh", () => {
    it("Should return 401 token_invalid [expired]", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: expired })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("token_expirado");
    });

    it("Should return refreshed tokens", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: tokenPair.refresh })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(200);
      expect(Object.keys(response.body.data)).toEqual(["access", "refresh"]);

      refreshed = response.body.data.refresh;
    });

    it("Should return 400 unknown_fields", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: tokenPair.refresh, unknown_field: "foo" })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].type).toBe("unknown_fields");
    });

    it("Should return 401 token_invalid [repeat use]", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: tokenPair.refresh })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("token_invalido");
    });

    it("Should return 401 token_invalid [invalidated by repeat use]", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: refreshed })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("token_invalido");
    });

    it("Should return 401 token_invalid [wrong type]", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: tokenPair.access })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("wrong_token_type");
    });

    it("Should return 401 token_invalid [user-agent]", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: tokenPair.refresh })
        .set("User-Agent", "wrong_user_agent");

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("token_invalido");
    });
  });

  describe("POST: /auth/logout", () => {
    beforeAll(generateTokens);

    it("Should return 200", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/logout`)
        .send({ token: tokenPair.access })
        .set("Authorization", `Bearer ${tokenPair.access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(200);
    });

    it("Should return 401 token_invalid", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/refresh`)
        .send({ token: tokenPair.refresh })
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("token_invalido");
    });

    /** Attempt to disable someone else's token */
    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/auth/logout`)
        .send({ token: tokenPair.access })
        .set("Authorization", `Bearer ${tokenPair2.access}`)
        .set("User-Agent", USER_AGENT);

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
      panel_id: -15,
    },
  });
  player2 = await prisma.player.create({
    data: {
      username: "jest_test2" + Date.now(),
      email: "jest_test2" + Date.now() + "@test.com",
      password: "1234",
      panel_id: -20,
    },
  });

  await generateTokens();
}

async function cleanUp() {
  await prisma.token.deleteMany({ where: { player_id: player.id } });
  await prisma.token.deleteMany({ where: { player_id: player2.id } });
  await prisma.player.delete({ where: { id: player.id } });
  await prisma.player.delete({ where: { id: player2.id } });
  prisma.$disconnect();
}

async function generateTokens() {
  const authServices = new AuthServices();
  const result = await authServices.tokens(player.id, USER_AGENT);
  tokenPair = result.tokens;
  const result2 = await authServices.tokens(player2.id, USER_AGENT);
  tokenPair2 = result2.tokens;

  const payload = jwt.verify(tokenPair.access, CONFIG.APP.CYPHER_PASS!);
  expired = jwt.sign(
    {
      ...(payload as jwt.JwtPayload),
      exp: Math.floor(Date.now() / 1000) - 60,
    },
    CONFIG.APP.CYPHER_PASS!,
  );
}
