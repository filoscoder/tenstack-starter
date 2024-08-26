import { BAD_REQUEST, CREATED, FORBIDDEN, OK, UNAUTHORIZED } from "http-status";
import { SuperAgentTest } from "supertest";
import { Cashier, Player } from "@prisma/client";
import { initAgent } from "./helpers";
import {
  mockCreateCasinoPlayer,
  mockSend,
  preparePlayerTest,
} from "./mocks/player/create";
import { generateAccessToken } from "./helpers/auth";
import {
  mockGetBalance,
  preparePlayerBalanceTest,
} from "./mocks/player/balance";
import {
  mockBonus,
  mockFindMany,
  preparePlayerBonusTest,
} from "./mocks/player/bonus";
import CONFIG from "@/config";
import * as crypt from "@/utils/crypt";

let agent: SuperAgentTest;
let agentAccessToken: string;
let agentEmail: string;
let playerAccessToken: string;
let player: Player;
let cashier: Cashier;
let cleanUp: () => Promise<any>;

beforeAll(setUp);
afterAll(() => cleanUp());

describe("[UNIT] => PLAYERS ROUTER", () => {
  const username = "jest_test" + Date.now();
  const email = username + "@test.com";
  const password = "1234";
  const movile_number = "5490000000000";

  describe("POST: /players", () => {
    beforeAll(preparePlayerTest);
    afterEach(() => jest.clearAllMocks());

    it("Should create a player with default role", async () => {
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
      expect(result.player.cashier_id).toBe(undefined);
    });

    it("Should create a player with role of player", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        roles: [CONFIG.ROLES.PLAYER],
      });
      const result = response.body.data;

      expect(response.status).toBe(CREATED);
      expect(result.player.cashier_id).toBe(undefined);
    });

    it("Should create a player as child of cashier using cashier id", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        cashier_id: cashier.id,
      });
      const result = response.body.data;

      expect(response.status).toBe(CREATED);
      expect(result.player.cashier_id).toBe(cashier.id);
    });

    it("Should create a player as child of cashier using cashier handle", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        cashier_id: cashier.handle,
      });
      const result = response.body.data;

      expect(response.status).toBe(CREATED);
      expect(result.player.cashier_id).toBe(cashier.id);
    });

    it("Should create a player with role of cashier", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        roles: [CONFIG.ROLES.PLAYER, CONFIG.ROLES.CASHIER],
      });
      const result = response.body.data;

      expect(response.status).toBe(CREATED);
      expect(result.player.cashier_id).toBe("cashier_id");
    });

    it("Should also create a player with role of cashier", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        roles: [CONFIG.ROLES.CASHIER],
      });
      const result = response.body.data;

      expect(response.status).toBe(CREATED);
      expect(result.player.cashier_id).toBe("cashier_id");
    });

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
        email: player.email,
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("Usuario con ese email ya existe");
    });

    it.only("Should return 400 invalid cashier_id", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        cashier_id: "foo",
      });

      console.log("RESPONSE", response.body);
      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("cashier_id inválido.");
    });

    it("Should return 400", async () => {
      const response = await agent.post(`/app/${CONFIG.APP.VER}/players`).send({
        username,
        password,
        email,
        cashier_id: cashier.id,
        roles: [CONFIG.ROLES.CASHIER],
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(
        "No se puede crear un cajero como hijo de otro cajero.",
      );
    });
  });

  describe("POST: /players/:id", () => {
    it("Should update player details", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/${player.id}`)
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
        .post(`/app/${CONFIG.APP.VER}/players/${player.id}`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          unknown_field: "Jest",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 email already in use", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/${player.id}`)
        .set("Authorization", `Bearer ${agentAccessToken}`)
        .send({
          email: agentEmail,
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("Ese email ya está en uso");
    });
  });

  describe("POST: /players/login", () => {
    beforeAll(() => {
      //@ts-ignore
      crypt.compare = jest.fn((a, b) => a == b);
    });

    it("Should log player in", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/players/login`)
        .send({
          username: player.username,
          password: player.password,
        });

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toEqual([
        "access",
        "refresh",
        "player",
      ]);
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
        "cashier_id",
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
        .get(`/app/${CONFIG.APP.VER}/players/${player.id}`)
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
        "cashier_id",
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
        `/app/${CONFIG.APP.VER}/players/${player.id}`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/players/abcd`);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /players/:id/balance", () => {
    beforeAll(preparePlayerBalanceTest);

    it("Should return player balance", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players/${player.id}/balance`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(OK);
      expect(mockGetBalance).toHaveBeenCalledTimes(1);
      expect(response.body.data).toBe(420);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/players/${player.id}/balance`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 404", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/players/nonexistent/balance`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /players/:id/bonus", () => {
    beforeAll(preparePlayerBonusTest);

    it("Should return player bonus", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players/${player.id}/bonus`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(OK);
      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(response.body.data)).toBe(
        JSON.stringify([mockBonus]),
      );
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/players/${player.id}/bonus`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/players/lord-farquard/bonus`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });
});

async function setUp() {
  agent = await initAgent();

  ({
    token: agentAccessToken,
    user: { email: agentEmail },
    cleanUp,
  } = await generateAccessToken(CONFIG.ROLES.AGENT));

  ({ token: playerAccessToken, user: player } = await generateAccessToken(
    CONFIG.ROLES.PLAYER,
  ));

  ({
    user: { Cashier: cashier },
  } = await generateAccessToken(CONFIG.ROLES.CASHIER));
}
