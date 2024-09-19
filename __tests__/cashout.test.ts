import { BankAccount, Player, PrismaClient } from "@prisma/client";
import { SuperAgentTest } from "supertest";
import { BAD_REQUEST, OK, TOO_MANY_REQUESTS, UNAUTHORIZED } from "http-status";
import { initAgent } from "./helpers";
import { prepareCashoutTest } from "./mocks/payment/create";
import { TokenPair } from "@/types/response/jwt";
import { AuthServices } from "@/components/auth/services";
import CONFIG from "@/config";
import { CashoutRequest } from "@/types/request/transfers";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let players: (Player & { BankAccounts: BankAccount[] })[];
let cashoutRequest: CashoutRequest;
const tokens: TokenPair[] = [];

beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => CASHOUT", () => {
  describe.only("POST: /transactions/cashout", () => {
    beforeAll(() => {
      prepareCashoutTest();
    });

    afterEach(() => jest.clearAllMocks());

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

  const result = await prisma.player.findMany({
    where: { BankAccounts: { some: { NOT: { id: "" } } } },
    take: 2,
    include: { BankAccounts: true },
  });

  if (!result[0] || !result[1]) throw new Error("Players not found");
  if (!result[0].BankAccounts.length || !result[1].BankAccounts.length)
    throw new Error("Player needs a bank account");

  players = result;

  cashoutRequest = {
    amount: 0.01,
    bank_account: players[0].BankAccounts[0].id,
  };

  const authServices = new AuthServices();
  const auth1 = await authServices.tokens(players[0].id, "jest_test");
  const auth2 = await authServices.tokens(players[1].id, "jest_test");
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
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}
