import { BankAccount, Deposit, Player, PrismaClient } from "@prisma/client";
import { SuperAgentTest } from "supertest";
import {
  BAD_REQUEST,
  FORBIDDEN,
  OK,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "http-status";
import { initAgent } from "./helpers";
import { TokenPair } from "@/types/response/jwt";
import { AuthServices } from "@/components/auth/services";
import CONFIG from "@/config";
import { CashoutRequest, DepositRequest } from "@/types/request/transfers";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let players: (Player & { BankAccounts: BankAccount[] })[];
let depositRequests: DepositRequest[];
let cashoutRequest: CashoutRequest;
const tokens: TokenPair[] = [];
const deposits: Deposit[] = [];
let confirmedDeposit: Deposit;

beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => TRANSACTIONS", () => {
  describe("POST: /transactions/deposit", () => {
    it("Should create a deposit", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send(depositRequests[0])
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.deposit).toBeDefined();

      deposits[0] = response.body.data.deposit;
    });

    it("Should create a deposit for player 2", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send(depositRequests[1])
        .set("Authorization", `Bearer ${tokens[1].access}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.deposit).toBeDefined();

      deposits[1] = response.body.data.deposit;
    });

    it.each`
      field                | message
      ${"tracking_number"} | ${"tracking_number is required"}
    `("Should return 400 missing_fields", async ({ field, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send({
          ...depositRequests[0],
          [field]: undefined,
        })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
      expect(response.body.data[0].path).toBe(field);
    });

    it("Should return 400 unknown_field", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send({
          ...depositRequests[0],
          unknown_field: "unknown",
        })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send(depositRequests[0]);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("POST: /transactions/deposit/:id", () => {
    it("Should attempt to confirm a deposit", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[1].id}`)
        .send(depositRequests[1])
        .set("Authorization", `Bearer ${tokens[1].access}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.deposit).toBeDefined();
    });

    it("Should return 401", async () => {
      const response = await agent.post(
        `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    /** Attempt to confirm someone else's deposit */
    it("Attempts to confirm someone else's deposit.\n Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[1].id}`)
        .send(depositRequests[1])
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit/-10`)
        .send(depositRequests[1])
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(404);
    });
  });

  describe("GET: /transactions/deposit/pending", () => {
    it("Should return pending deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/deposit/pending`)
        .set("Authorization", `Bearer ${tokens[1].access}`);

      const deposits = response.body.data as Deposit[];

      expect(response.status).toBe(OK);
      expect(Object.keys(deposits[0])).toEqual([
        "id",
        "player_id",
        "currency",
        "dirty",
        "status",
        "tracking_number",
        "amount",
        "created_at",
        "updated_at",
      ]);
      /**
       * Expect it only returns deposits belonging to the authenticated player
       */
      expect(deposits.map((deposit: Deposit) => deposit.player_id)).toEqual(
        Array(deposits.length).fill(players[1].id),
      );
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/transactions/deposit/pending`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("POST: /transactions/cashout", () => {
    it("Should create a withdrawal", async () => {
      const result = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send(cashoutRequest)
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(result.status).toBe(OK);
    });

    it("Should return 429 too_many_requests", async () => {
      const result = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send(cashoutRequest)
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(result.status).toBe(TOO_MANY_REQUESTS);
    });

    it.each`
      field             | message
      ${"amount"}       | ${"amount is required"}
      ${"bank_account"} | ${"bank_account (account id) is required"}
    `("Should return 400 missing_fields", async ({ field, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send({
          ...cashoutRequest,
          [field]: undefined,
        })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
      expect(response.body.data[0].path).toBe(field);
    });

    it("Should return 400 unknown_field", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send({
          ...cashoutRequest,
          unknown_field: "unknown",
        })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 (amount too large)", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send({
          ...cashoutRequest,
          amount: 4294967297,
        })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(
        "amount must be a number between 0 and 2**32",
      );
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send(cashoutRequest);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();
  const TEST_DEPOSIT = "53771ALBO11032024195558814";

  const result = await prisma.player.findMany({
    where: { BankAccounts: { some: { NOT: { id: "" } } } },
    take: 2,
    include: { BankAccounts: true },
  });

  if (!result[0] || !result[1]) throw new Error("Players not found");
  if (!result[0].BankAccounts.length || !result[1].BankAccounts.length)
    throw new Error("Player needs a bank account");

  players = result;

  await prisma.deposit.deleteMany({ where: { tracking_number: TEST_DEPOSIT } });

  depositRequests = [
    {
      tracking_number: TEST_DEPOSIT,
    },
    {
      tracking_number: "test_tracking_number2" + Date.now(),
    },
  ];

  cashoutRequest = {
    amount: 0.01,
    bank_account: players[0].BankAccounts[0].id,
  };

  confirmedDeposit = await prisma.deposit.create({
    data: {
      status: CONFIG.SD.DEPOSIT_STATUS.CONFIRMED,
      player_id: players[0].id,
      currency: "MXN",
      tracking_number: "test_tracking_number4" + Date.now(),
      amount: 0.01,
    },
  });

  const authServices = new AuthServices();
  const auth1 = await authServices.tokens(players[0].id);
  const auth2 = await authServices.tokens(players[1].id);
  tokens[0] = auth1.tokens;
  tokens[1] = auth2.tokens;

  /**
   * Clear latest cashouts
   */
  const dayInMs = 1000 * 60 * 60 * 24;
  await prisma.payment.deleteMany({
    where: {
      player_id: players[0].id,
      updated_at: { gte: new Date(Date.now() - dayInMs) },
    },
  });
}

async function cleanUp() {
  try {
    await prisma.token.deleteMany({
      where: { player_id: players[0].id },
    });
    await prisma.token.deleteMany({
      where: { player_id: players[1].id },
    });
    await prisma.deposit.delete({ where: { id: confirmedDeposit.id } });
    await prisma.deposit.delete({ where: { id: deposits[0].id } });
    await prisma.deposit.delete({ where: { id: deposits[1].id } });
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}
