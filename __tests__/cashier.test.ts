import { SuperAgentTest } from "supertest";
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "http-status";
import { Cashier, Player } from "@prisma/client";
import { initAgent } from "./helpers";
import { generateAccessToken } from "./helpers/auth";
import { prepareCashierCashoutTest } from "./mocks/cashier/cashout";
import { prepareGeneralReportTest } from "./mocks/cashier/generalReport";
import CONFIG from "@/config";

let agent: SuperAgentTest;
let cashierAccessToken: string;
let cashier: Cashier;
let playerAccessToken: string;
let player: Player;
let cleanUp: () => Promise<any>;

beforeAll(async () => {
  agent = await initAgent();
  ({
    token: cashierAccessToken,
    user: { Cashier: cashier },
    user: player,
    cleanUp,
  } = await generateAccessToken(CONFIG.ROLES.CASHIER));
  ({ token: playerAccessToken } = await generateAccessToken(
    CONFIG.ROLES.PLAYER,
  ));
});

afterAll(() => cleanUp());

describe("[UNIT] => CASHIER ROUTER", () => {
  describe("GET: /cashier/:id/player", () => {
    it("Should return a list of players", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.result.length).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/nonexistent/player`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /cashier/:id/player/:player_id", () => {
    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player/`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player/`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player/nonexistent`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(NOT_FOUND);
    });
  });

  describe.only("GET: /cashier/:id/player/:player_id/general-report", () => {
    beforeAll(() => prepareGeneralReportTest());
    afterAll(jest.clearAllMocks);

    it("Should return a general report", async () => {
      const date_from = "2024-08-01T00:00-03:00";
      const date_to = "2024-08-31T23:59-03:00";
      const url =
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player/` +
        `${player.id}/general-report?` +
        `date_from=${date_from}&date_to=${date_to}`;

      const response = await agent
        .get(url)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(OK);
    });

    it("Should return 400", async () => {
      const date_from = new Date().toISOString();
      const date_to = "2024-08-31T23:59-03:00";
      const url =
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player/` +
        `${player.id}/general-report?` +
        `date_from=${date_from}&date_to=${date_to}`;
      const response = await agent
        .get(url)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("Formato inválido en date_from");
    });

    it("Should return 401", async () => {
      const date_from = "2024-08-01T00:00-03:00";
      const date_to = "2024-08-31T23:59-03:00";
      const url =
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/player/` +
        `${player.id}/general-report?` +
        `date_from=${date_from}&date_to=${date_to}`;

      const response = await agent.get(url);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET: /cashier/:id/balance", () => {
    it("Should return cashier's balance", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/balance`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data).toBe(undefined);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/balance`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/balance`)
        .set("Authorization", `Bearer ${playerAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/nonexistent/balance`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /cashier/:id/cashout", () => {
    beforeAll(() => prepareCashierCashoutTest());
    afterAll(jest.clearAllMocks);

    it("Should redeem cashier's balance", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/${cashier.id}/cashout`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.player_balance_after).toBe(10);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/cashier/${cashier.id}/cashout`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/cashier/foreign/cashout`)
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("POST: /cashier/:id/update", () => {
    it("Should update cashier's handle", async () => {
      const response = await agent
        .post(`/app/v1/cashier/${cashier.id}/update`)
        .send({ handle: "@aegon" })
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toEqual([
        "id",
        "handle",
        "username",
        "password",
        "panel_id",
        "access",
        "refresh",
        "dirty",
        "last_cashout",
        "created_at",
        "updated_at",
      ]);
    });

    it("Should return 400", async () => {
      const response = await agent
        .post(`/app/v1/cashier/${cashier.id}/update`)
        .send({ unknown_field: "foo" })
        .set("Authorization", `Bearer ${cashierAccessToken}`);

      expect(response.status).toBe(BAD_REQUEST);
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/v1/cashier/${cashier.id}/update`)
        .send({ handle: "@aegon" });

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });
});
