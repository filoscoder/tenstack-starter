import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "http-status";
import { SuperAgentTest } from "supertest";
import { PrismaClient } from "@prisma/client";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { Whatsapp } from "@/notification/whatsapp";
import { PlayerServices } from "@/components/players/services";
import { AuthServices } from "@/components/auth/services";

const USER_AGENT = "jest_test";
let agent: SuperAgentTest;
let prisma: PrismaClient;
let playerId: string;
let agentAccessToken: string;
let agentEmail: string;

beforeAll(setUp);
afterAll(cleanUp);

describe("[UNIT] => PLAYERS ROUTER", () => {
  let playerAccessToken: string;
  const username = "jest_test" + Date.now();
  const email = username + "@test.com";
  const password = "1234";
  const movile_number = "5490000000000";

  describe("POST: /players", () => {
    const mockCreateCasinoPlayer = jest.fn(async () => -420);
    jest
      .spyOn((PlayerServices as any).prototype, "createCasinoPlayer")
      .mockImplementation(mockCreateCasinoPlayer);

    it("Should create a player", async () => {
      const mockSend = jest.fn();
      jest.spyOn(Whatsapp, "send").mockImplementation(mockSend);

      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        movile_number,
      });

      const result = response.body.data;

      expect(mockCreateCasinoPlayer).toHaveBeenCalledTimes(1);
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

    it.each`
      field              | value             | message
      ${"password"}      | ${"a".repeat(73)} | ${"password must be under 73 characters"}
      ${"email"}         | ${email}          | ${"Usuario con ese email ya existe"}
      ${"movile_number"} | ${"345sdfg"}      | ${"movile_number must be a numeric string"}
      ${"movile_number"} | ${"1".repeat(21)} | ${"movile_number is too long"}
      ${"status"}        | ${"foo"}          | ${"invalid status"}
    `;
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

    // it("Should return 400 ya_existe", async () => {
    //   const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
    //     username,
    //     password,
    //     email: "jest_test" + Date.now() + "@test.com",
    //   });

    //   expect(response.status).toBe(BAD_REQUEST);
    //   expect(response.body.code).toBe("ya_existe");
    // });
  });

  describe("POST: /players/:id", () => {
    it("Should update player details", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/${playerId}`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          first_name: "Jest",
          last_name: "Test",
        });

      expect(response.status).toBe(OK);
      expect(response.body.data.first_name).toBe("Jest");
      expect(response.body.data.last_name).toBe("Test");
    });

    it("Should return 400 unknown field", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/${playerId}`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          unknown_field: "Jest",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 email already in use", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/${playerId}`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          email: agentEmail,
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("Ese email ya está en uso");
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
    it("Should return list of players", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.result).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);
      expect(Object.keys(response.body.data.result[0])).toEqual([
        "id",
        "panel_id",
        "username",
        "password",
        "email",
        "first_name",
        "last_name",
        "date_of_birth",
        "movile_number",
        "country",
        "balance_currency",
        "status",
        "created_at",
        "updated_at",
      ]);
    });

    it.each`
      field               | value    | message
      ${"page"}           | ${"-1"}  | ${"page must be greater than 0"}
      ${"items_per_page"} | ${"l"}   | ${"items_per_page must be greater than 0"}
      ${"sort_column"}    | ${"foo"} | ${"Invalid sort_column"}
      ${"sort_direction"} | ${"baz"} | ${"sort_direction must be 'asc' or 'desc'"}
    `("Shloud return 400", async ({ field, value, message }) => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players?${field}=${value}`)
        .set("Authorization", `Bearer ${agentAccessToken}`);
      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/players`);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /players/:id", () => {
    it("Should return player info", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players/${playerId}`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(Object.keys(response.body.data[0])).toEqual([
        "id",
        "panel_id",
        "username",
        "password",
        "email",
        "first_name",
        "last_name",
        "date_of_birth",
        "movile_number",
        "country",
        "balance_currency",
        "status",
        "created_at",
        "updated_at",
        "BankAccounts",
        "roles",
      ]);
      expect(response.body.data[0].password).toBe("********");
    });

    it.each`
      field               | value    | message
      ${"page"}           | ${"-1"}  | ${"page must be greater than 0"}
      ${"sort_column"}    | ${"foo"} | ${"Invalid sort_column"}
      ${"sort_direction"} | ${"baz"} | ${"sort_direction must be 'asc' or 'desc'"}
    `("Shloud return 400", async ({ field, value, message }) => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players?${field}=${value}`)
        .set("Authorization", `Bearer ${agentAccessToken}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/players/${playerId}`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/players/abcd`);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /players/:id", () => {
    it("Should return player info", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players/${playerId}`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data[0].id).toBe(playerId);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/players/${playerId}`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/players/abcd`);

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

async function setUp() {
  prisma = new PrismaClient();
  agent = await initAgent();
  const agentUser = await prisma.player.findFirst({
    where: { roles: { some: { name: CONFIG.ROLES.AGENT } } },
  });
  if (!agentUser) throw new Error("No agent found");
  agentEmail = agentUser.email;
  const authServices = new AuthServices();
  const { tokens } = await authServices.tokens(agentUser.id);
  agentAccessToken = tokens.access;
}

async function cleanUp() {
  await prisma.player.delete({ where: { id: playerId } });
  await prisma.$disconnect();
}
