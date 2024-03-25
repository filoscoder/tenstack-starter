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
} from "@prisma/client";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { AuthServices } from "@/components/auth/services";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let player: Player & { BankAccounts: BankAccount[] };
let playerAccessToken: string;
let payment: Payment;
let deposit: Deposit;
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
          username: "agente",
          password: "E8DaacEN/G5pdWS/FjHYlpw+csU6OKpU",
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
      expect(response.body.message).toBe("Solo agentes");
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

  describe("GET: /agent/payments", () => {
    it("Should return payments", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/payments`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(Object.keys(response.body.data[0])).toStrictEqual([
        "id",
        "player_id",
        "amount",
        "paid",
        "bank_account",
        "currency",
        "created_at",
        "updated_at",
        "Player",
        "BankAccount",
      ]);
    });

    /** Wrong token */
    it("Should return 401", async () => {
      const response = await await agent
        .get(`/app/${CONFIG.APP.VER}/agent/payments`)
        .set("Authorization", `Bearer ${refresh}`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.description).toBe("Token invalido");
    });

    /** No token */
    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/agent/payments`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/payments`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("PUT: /agent/payments/:id/paid", () => {
    it("Should mark payment as paid", async () => {
      const response = await agent
        .put(`/app/${CONFIG.APP.VER}/agent/payments/${payment.id}/paid`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toStrictEqual([
        "id",
        "player_id",
        "amount",
        "paid",
        "bank_account",
        "currency",
        "created_at",
        "updated_at",
      ]);
      expect(response.body.data.paid).toBeTruthy();
    });

    it("Should return 401", async () => {
      const response = await agent.put(
        `/app/${CONFIG.APP.VER}/agent/payments/${payment.id}/paid`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .put(`/app/${CONFIG.APP.VER}/agent/payments/${payment.id}/paid`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .put(`/app/${CONFIG.APP.VER}/agent/payments/-1/paid`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(NOT_FOUND);
    });
  });

  describe("GET: /agent/deposits", () => {
    it("Should return deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/deposits`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(Object.keys(response.body.data[0])).toStrictEqual([
        "id",
        "player_id",
        "currency",
        "dirty",
        "status",
        "tracking_number",
        "amount",
        "coins_transfered",
        "paid_at",
        "created_at",
        "updated_at",
        "Player",
      ]);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/agent/deposits`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/deposits`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /agent/qr", () => {
    it("Should return 200", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/qr`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/agent/qr`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/qr`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("PUT: /agent/bank-account", () => {
    it("Should update bank account", async () => {
      const response = await agent
        .put(`/app/${CONFIG.APP.VER}/agent/bank-account`)
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
        .put(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT)
        .send({
          unknownField: "foo",
        });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .put(`/app/${CONFIG.APP.VER}/agent/bank-account`)
        .send({ name: "Juancito" });

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .put(`/app/${CONFIG.APP.VER}/agent/bank-account`)
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
        "dni",
        "name",
        "alias",
        "clabe",
        "bankName",
        "accountNumber",
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
    it("Should return balance", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/balance`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toStrictEqual([
        "balance",
        "currency",
      ]);
    });

    it("Should return 401", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/agent/balance`);

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/balance`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe("GET: /agent/deposits/complete", () => {
    it("Should return completed deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/deposits/complete`)
        .set("Authorization", `Bearer ${access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/agent/deposits/complete`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/agent/deposits/complete`)
        .set("Authorization", `Bearer ${playerAccessToken}`)
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
      panel_id: -10,
      BankAccounts: {
        create: [
          {
            bankName: "Test Bank " + Date.now(),
            bankNumber: `${Date.now()}`,
            owner: "Test owner",
            bankAlias: "Test alias",
            owner_id: 123123123,
          },
        ],
      },
    },
    include: {
      BankAccounts: true,
    },
  });

  payment = await prisma.payment.create({
    data: {
      amount: 0.01,
      bank_account: player.BankAccounts[0].id,
      player_id: player?.id,
      currency: "MXN",
    },
  });

  deposit = await prisma.deposit.create({
    data: {
      amount: 0.01,
      player_id: player.id,
      currency: "MXN",
      status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
      tracking_number: "test_tracking_number3" + Date.now(),
      paid_at: new Date().toISOString(),
      coins_transfered: new Date().toISOString(),
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
  // await prisma.token.delete({ where: { }})
  await prisma.player.delete({ where: { id: player.id } });
  prisma.$disconnect();
}
