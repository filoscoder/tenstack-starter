import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "http-status";
import { SuperAgentTest } from "supertest";
import { PrismaClient } from "@prisma/client";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { Whatsapp } from "@/notification/whatsapp";

let agent: SuperAgentTest;
let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient();
  agent = await initAgent();
});

describe("[UNIT] => PLAYERS ROUTER", () => {
  let playerId: string;
  let playerAccessToken: string;
  const username = "jest_test" + Date.now();
  const email = username + "@test.com";
  const password = "1234";
  const movile_number = "5490000000000";

  describe("POST: /players", () => {
    it.only("Should create a player", async () => {
      const mockSend = jest.fn();
      jest.spyOn(Whatsapp, "send").mockImplementation(mockSend);

      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        movile_number,
      });

      const result = response.body.data;

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(CREATED);
      expect(Object.keys(result)).toEqual(["access", "refresh", "player"]);

      playerId = result.player.id;
    });

    it("Should return player.role === player", async () =>
      checkPlayerRole(playerId));

    it("Should delete player", async () => {
      await prisma.token.deleteMany({ where: { player_id: playerId } });
      await prisma.player.delete({ where: { id: playerId } });
    });

    it("Should re-create the player", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
      });

      const result = response.body.data;

      expect(response.status).toBe(CREATED);
      expect(Object.keys(result)).toEqual(["access", "refresh", "player"]);

      playerId = result.player.id;
    });

    it("Should return player.role === player", async () =>
      checkPlayerRole(playerId));

    it.each`
      field         | message
      ${"username"} | ${"username is required"}
      ${"password"} | ${"password is required"}
      ${"email"}    | ${"email is required"}
    `(
      "Should return 400 Bad Request (mandatory fields missing)",
      async ({ field, message }) => {
        const response = await agent
          .post(`/app/${CONFIG.APP.VER}/players`)
          .send({
            username,
            password,
            [field]: undefined,
          });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.body.data[0].msg).toBe(message);
      },
    );

    it("Should return 400 password too long", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password: "a".repeat(73),
        email,
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(
        "password must be under 73 characters",
      );
    });

    it("Should return 400 Email already in use", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("Usuario con ese email ya existe");
    });

    it("Should return 400 ya_existe", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email: "jest_test" + Date.now() + "@test.com",
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.code).toBe("ya_existe");
    });
  });

  describe("POST: /players/login", () => {
    it("Should return token and player data", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/login`)
        .send({
          username,
          password,
        });

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toEqual([
        "access",
        "refresh",
        "player",
      ]);

      playerAccessToken = response.body.data.access;
    });

    it("Should return 400 Bad Request (password missing)", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/login`)
        .send({
          username,
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.code).toBe("bad_request");
    });

    it("Should return 400 invalid credentials", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/login`)
        .send({
          username: "XXXXXX",
          password,
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.code).toBe("credenciales_invalidas");
    });
  });

  describe("GET: /players", () => {
    it("Should return player info", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.id).toBe(playerId);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/players`);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });
});

async function checkPlayerRole(player_id: string) {
  const player = await prisma.player.findUnique({
    where: { id: player_id },
    include: { roles: true },
  });
  expect(player!.roles).toHaveLength(1);
  expect(player!.roles[0].name).toBe("player");
}
