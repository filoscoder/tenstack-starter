import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "http-status";
import { SuperAgentTest } from "supertest";
import {
  BankAccount,
  Deposit,
  Payment,
  Player,
  PrismaClient,
  Role,
} from "@prisma/client";
import { AlquimiaTransferService } from "../src/services/alquimia-transfer.service";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { AuthServices } from "@/components/auth/services";
import { PlayerServices } from "@/components/players/services";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let player: Player & { BankAccounts: BankAccount[] };
let playerAccessToken: string;
let payment: Payment & { BankAccount: BankAccount };
let deposit: Deposit;
let userWithAgentRole: Player & { roles: Role[] };
const USER_AGENT = "jest_test";

const credentials = {
  username: "jest_test" + Date.now(),
  password: "1234",
  email: "jest_test" + Date.now() + "@test.com",
};

beforeAll(initialize);

afterAll(cleanUp);

describe("[UNIT] => AGENT ROUTER", () => {
  let access: string;
  let refresh: string;

  describe("POST: /agent/login", () => {
    it("Should return 200", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/login`)
        .send({
          username: process.env.AGENT_PANEL_USERNAME,
          password: process.env.AGENT_PANEL_PASSWORD,
        })
        .set("User-Agent", USER_AGENT);

      const tokens = response.body.data.access;

      expect(response.status).toBe(OK);
      expect(Object.keys(tokens)).toEqual(["access", "refresh"]);

      access = tokens.access;
      refresh = tokens.refresh;
    });

    it("Should return 401 Solo agentes", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/login`)
        .send({
          username: "test19",
          password: "1234",
        });

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.data).toBe("Solo agentes");
    });

    it("Should return 404", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/login`)
        .send({
          username: "XXXXXX",
          password: "1234",
        });

      expect(response.status).toBe(NOT_FOUND);
    });
  });

  describe("GET: /transactions/payment", () => {
    it("Should return payments", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/payment`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.payments.length).toBeGreaterThanOrEqual(0);
      expect(response.body.data.totalPayments).toBeGreaterThanOrEqual(0);
      expect(Object.keys(response.body.data.payments[0])).toStrictEqual([
        "id",
        "player_id",
        "amount",
        "status",
        "bank_account",
        "currency",
        "dirty",
        "alquimia_id",
        "created_at",
        "updated_at",
        "Player",
        "BankAccount",
      ]);
      expect(response.body.data.payments[0].Player.password).toBe("********");
    });

    it.each`
      field               | value    | message
      ${"page"}           | ${"-1"}  | ${"page must be greater than 0"}
      ${"sort_column"}    | ${"foo"} | ${"Invalid sort_column"}
      ${"sort_direction"} | ${"baz"} | ${"sort_direction must be 'asc' or 'desc'"}
    `("Shloud return 400", async ({ field, value, message }) => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/payment?${field}=${value}`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
    });

    /** Wrong token */
    it("Should return 401", async () => {
      const response = await await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/payment`)
        .set("Authorization", `Bearer ${refresh}`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("token_invalido");
    });

    /** No token */
    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/transactions/payment`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.code).toBe("Unauthorized");
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/payment`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("POST: /agent/payments/:id/release", () => {
    const mockResponse = {
      id_transaccion: 314420,
      estatus: "EN PROCESO",
      detalle_proveedor: {
        error: false,
        message: "",
      },
    };
    jest
      .spyOn(AlquimiaTransferService.prototype, "pay")
      .mockResolvedValue(mockResponse);

    it("Should mark payment as paid", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/payments/${payment.id}/release`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toStrictEqual([
        "id",
        "player_id",
        "amount",
        "status",
        "bank_account",
        "currency",
        "dirty",
        "alquimia_id",
        "created_at",
        "updated_at",
      ]);
      expect(response.body.data.alquimia_id).toBe(314420);
      expect(response.body.data.status).toBe("EN PROCESO");
    });

    it("Should return 401", async () => {
      const response = await agent.post(
        `/app/${CONFIG.APP.VER}/agent/payments/${payment.id}/release`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/payments/${payment.id}/release`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/payments/-1/release`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(NOT_FOUND);
    });
  });

  describe("GET: /transactions/deposit", () => {
    it("Should return deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.deposits.length).toBeGreaterThanOrEqual(0);
      expect(response.body.data.totalDeposits).toBeGreaterThanOrEqual(0);
      expect(Object.keys(response.body.data.deposits[0])).toStrictEqual([
        "id",
        "player_id",
        "currency",
        "dirty",
        "status",
        "tracking_number",
        "amount",
        "created_at",
        "updated_at",
        "Player",
      ]);
      expect(response.body.data.deposits[0].Player.password).toBe("********");
    });

    it.each`
      field               | value    | message
      ${"page"}           | ${"-1"}  | ${"page must be greater than 0"}
      ${"sort_column"}    | ${"foo"} | ${"Invalid sort_column"}
      ${"sort_direction"} | ${"baz"} | ${"sort_direction must be 'asc' or 'desc'"}
    `("Shloud return 400", async ({ field, value, message }) => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/deposit?${field}=${value}`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/transactions/deposit`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /transactions/deposit/pending-coin-transfers", () => {
    it("Should return pending coin transfers", async () => {
      const response = await agent
        .get(
          `/app/${CONFIG.APP.VER}/transactions/deposit/pending-coin-transfers`,
        )
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/transactions/deposit/pending-coin-transfers`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("POST: /agent/bank-account", () => {
    it("Should update bank account", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          name: "Test name",
          dni: "12345678",
          bankName: "Test bank name",
          accountNumber: "1234567890",
          clabe: "12345678901234567890",
          alias: "Test alias",
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toStrictEqual({
        name: "Test name",
        dni: "12345678",
        bankName: "Test bank name",
        accountNumber: "1234567890",
        clabe: "12345678901234567890",
        alias: "Test alias",
      });
    });

    it("Should return 400", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          unknownField: "foo",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .send({ name: "Juancito" });

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .send({ name: "Juancito" })
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /agent/bank-account", () => {
    it("Should return bank account", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toStrictEqual([
        "name",
        "dni",
        "bankName",
        "accountNumber",
        "clabe",
        "alias",
      ]);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/agent/bank-account`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /agent/balance", () => {
    it("Should return casino balance", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/balance/casino`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toStrictEqual(["balance"]);
    });

    // it("Should return alquimia balance", async () => {
    //   const response = await agent
    //     .get(`/app/${CONFIG.APP.VER}/agent/balance/alquimia`)
    //     .set("Authorization", `Bearer ${access}`)
    //     .set("User-Agent", USER_AGENT);

    //   expect(response.status).toBe(OK);
    //   expect(Object.keys(response.body.data)).toStrictEqual(["balance"]);
    // });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/agent/balance/casino`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/balance/casino`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/balance/unknown`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(NOT_FOUND);
    });
  });

  describe("GET: /agent/pending/deposits", () => {
    it("Should return completed deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/pending/deposits`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/agent/pending/deposits`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/pending/deposits`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("POST: /agent/on-call", () => {
    it("Should set on call status", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/on-call`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          active: true,
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeUndefined();
    });

    it("Should return 400", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/on-call`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          active: true,
          unknownField: "foo",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/on-call`)
        .send({ active: true });

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/on-call`)
        .send({ active: true })
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /agent/on-call", () => {
    it("Should return on call status", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/on-call`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeTruthy();
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/agent/on-call`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/on-call`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /agent/support", () => {
    it("Should return support numbers", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/support`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toEqual([
        "bot_phone",
        "human_phone",
      ]);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/agent/support`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/support`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("POST: /agent/support", () => {
    it("Should update support numbers", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/support`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          bot_phone: "555555555555",
          human_phone: "44444444444",
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toEqual({
        bot_phone: "555555555555",
        human_phone: "44444444444",
      });
    });

    it("Should return 400 unknown_fields", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/support`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          unknownField: "foo",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it.each`
      field            | value                      | message
      ${"bot_phone"}   | ${"555555555555555555555"} | ${"bot_phone must be a numeric string between 10 and 20 characters long"}
      ${"bot_phone"}   | ${"5555"}                  | ${"bot_phone must be a numeric string between 10 and 20 characters long"}
      ${"bot_phone"}   | ${"5555555555ABC"}         | ${"bot_phone must be a numeric string between 10 and 20 characters long"}
      ${"human_phone"} | ${"555555555555555555555"} | ${"human_phone must be a numeric string between 10 and 20 characters long"}
      ${"human_phone"} | ${"5555"}                  | ${"human_phone must be a numeric string between 10 and 20 characters long"}
      ${"human_phone"} | ${"5555555555ABC"}         | ${"human_phone must be a numeric string between 10 and 20 characters long"}
    `("Should return 400", async ({ field, value, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/support`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          [field]: value,
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/support`)
        .send({ bot_phone: "5555555", human_phone: "4444444" });

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/support`)
        .send({ bot_phone: "5555555", human_phone: "4444444" })
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("POST: /agent/reset-player-password", () => {
    jest.spyOn(PlayerServices.prototype, "resetPassword").mockResolvedValue();

    it("Should reset player password", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/reset-player-password`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          new_password: "1234",
          user_id: player.id,
        });

      expect(response.status).toBe(OK);
      expect(response.body.data).toBeUndefined();
    });

    it("Should return 400 unknown_fields", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/reset-player-password`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          new_password: "1234",
          user_id: player.id,
          unknownField: "foo",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 can only reset player passwords", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/agent/reset-player-password`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          new_password: "1234",
          user_id: userWithAgentRole.id,
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(
        "only player passwords can be updated",
      );
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();

  player = await prisma.player.create({
    data: {
      ...credentials,
      panel_id: -10,
      BankAccounts: {
        create: [
          {
            bankName: "Test Bank " + Date.now(),
            bankNumber: `${Date.now()}`,
            owner: "Test owner",
            bankAlias: "Test alias",
          },
        ],
      },
    },
    include: {
      BankAccounts: true,
    },
  });

  userWithAgentRole = await prisma.player.create({
    data: {
      email: "userWithAgentRole@example.com",
      password: "1234",
      panel_id: -11,
      username: "userWithAgentRole",
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

  payment = await prisma.payment.create({
    data: {
      amount: 0.01,
      bank_account: player.BankAccounts[0].id,
      player_id: player?.id,
      currency: "MXN",
    },
    include: { BankAccount: true },
  });

  deposit = await prisma.deposit.create({
    data: {
      amount: 0.01,
      player_id: player.id,
      currency: "MXN",
      status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
      tracking_number: "test_tracking_number3" + Date.now(),
    },
  });

  const authServices = new AuthServices();
  const { tokens } = await authServices.tokens(player.id, USER_AGENT);
  playerAccessToken = tokens.access;
}

async function cleanUp() {
  await prisma.payment.delete({ where: { id: payment.id } });
  await prisma.deposit.delete({ where: { id: deposit.id } });
  await prisma.bankAccount.delete({ where: { id: player.BankAccounts[0].id } });
  await prisma.token.deleteMany({ where: { player_id: player.id } });
  await prisma.player.delete({ where: { id: player.id } });
  await prisma.player.delete({ where: { id: userWithAgentRole.id } });
  prisma.$disconnect();
  jest.restoreAllMocks();
}
