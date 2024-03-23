import { BankAccount, Deposit, Player, PrismaClient } from "@prisma/client";
import { SuperAgentTest } from "supertest";
import { BAD_REQUEST, FORBIDDEN, OK, UNAUTHORIZED } from "http-status";
import { initAgent } from "./helpers";
import { TokenPair } from "@/types/response/jwt";
import { AuthServices } from "@/components/auth/services";
import CONFIG from "@/config";
import { TransferRequest } from "@/types/request/transfers";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let players: (Player & { BankAccounts: BankAccount[] })[];
let transferRequests: TransferRequest[];
const tokens: TokenPair[] = [];
const deposits: Deposit[] = [];

const USER_AGENT = "jest_test";

beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => TRANSACTIONS", () => {
  describe("POST: /transactions/deposit", () => {
    it("Should create a deposit", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send(transferRequests[0])
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.deposit).toBeDefined();

      deposits[0] = response.body.data.deposit;
    });

    it("Should create a deposit for player 2", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send(transferRequests[1])
        .set("Authorization", `Bearer ${tokens[1].access}`)
        .set("User-Agent", USER_AGENT);
      expect(response.status).toBe(OK);
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.deposit).toBeDefined();

      deposits[1] = response.body.data.deposit;
    });

    it.each`
      field             | message
      ${"amount"}       | ${"amount is required"}
      ${"currency"}     | ${"currency is required"}
      ${"bank_account"} | ${"bank_account (account id) is required"}
    `("Should return 400 missing_fields", async ({ field, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send({
          ...transferRequests[0],
          [field]: undefined,
        })
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].msg).toBe(message);
      expect(response.body.details[0].path).toBe(field);
    });

    it("Should return 400 unknown_field", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send({
          ...transferRequests[0],
          unknown_field: "unknown",
        })
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send(transferRequests[0]);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("POST: /transactions/deposit/:id", () => {
    it("Should confirm a deposit", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
      expect(response.body.data.status).toBeDefined();
    });

    it("Should return 401", async () => {
      const response = await agent.post(
        `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    /** Attempt to confirm someone else's deposit */
    it("Should return 403", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[1].id}`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit/-10`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(404);
    });
  });

  describe("GET: /transactions/deposit/pending", () => {
    it("Should return pending deposits", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/transactions/deposit/pending`)
        .set("Authorization", `Bearer ${tokens[1].access}`)
        .set("User-Agent", USER_AGENT);

      const deposits = response.body.data as Deposit[];

      expect(response.status).toBe(OK);
      expect(Object.keys(deposits[0])).toEqual([
        "id",
        "player_id",
        "amount",
        "confirmed",
        "bank_account",
        "currency",
        "dirty",
        "coins_transfered",
        "created_at",
        "updated_at",
      ]);
      expect(
        deposits.map((deposit: Deposit) => Number(deposit.player_id)),
      ).toEqual(Array(deposits.length).fill(players[1].id));
    });

    it("Should return 401", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/transactions/deposit/pending`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("DELETE: /transactions/deposit/:id", () => {
    /** Attempt to delete someone else's deposit */
    it("Should return 403", async () => {
      const response = await agent
        .delete(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[1].id}`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should delete a deposit", async () => {
      const response = await agent
        .delete(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[1].id}`)
        .set("Authorization", `Bearer ${tokens[1].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(OK);
    });

    it("Should return 400 bad_request", async () => {
      const response = await agent
        .delete(`/app/${CONFIG.APP.VER}/transactions/deposit/foo`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
    });

    it("Should return 401", async () => {
      const response = await agent.delete(
        `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    /** Attempt to delete a confirmed deposit */
    it("Should return 403 [deposit confirmed]", async () => {
      const response = await agent
        .delete(`/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .delete(`/app/${CONFIG.APP.VER}/transactions/deposit/-10`)
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(404);
    });
  });

  describe("POST: /transactions/cashout", () => {
    it("Should create a withdrawal", async () => {
      const result = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send(transferRequests[0])
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(result.status).toBe(OK);
    });

    it.each`
      field             | message
      ${"amount"}       | ${"amount is required"}
      ${"currency"}     | ${"currency is required"}
      ${"bank_account"} | ${"bank_account (account id) is required"}
    `("Should return 400 missing_fields", async ({ field, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send({
          ...transferRequests[0],
          [field]: undefined,
        })
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].msg).toBe(message);
      expect(response.body.details[0].path).toBe(field);
    });

    it("Should return 400 unknown_field", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send({
          ...transferRequests[0],
          unknown_field: "unknown",
        })
        .set("Authorization", `Bearer ${tokens[0].access}`)
        .set("User-Agent", USER_AGENT);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].type).toBe("unknown_fields");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/cashout`)
        .send(transferRequests[0]);

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();

  const result = await prisma.player.findMany({
    take: 2,
    include: { BankAccounts: true },
  });

  if (!result[0] || !result[1]) throw new Error("Players not found");
  if (!result[0].BankAccounts.length || !result[1].BankAccounts.length)
    throw new Error("Player needs a bank account");

  players = result;

  transferRequests = [
    {
      amount: 0.01,
      currency: "MXN",
      bank_account: players[0].BankAccounts[0].id,
    },
    {
      amount: 0.01,
      currency: "MXN",
      bank_account: players[1].BankAccounts[0].id,
    },
  ];

  const authServices = new AuthServices();
  const auth1 = await authServices.tokens(players[0].id, USER_AGENT);
  const auth2 = await authServices.tokens(players[1].id, USER_AGENT);
  tokens[0] = auth1.tokens;
  tokens[1] = auth2.tokens;
}

async function cleanUp() {
  await prisma.token.deleteMany({
    where: { player_id: players[0].id, user_agent: USER_AGENT },
  });
  await prisma.token.deleteMany({
    where: { player_id: players[1].id, user_agent: USER_AGENT },
  });
  await prisma.deposit.delete({ where: { id: deposits[0].id } });
  //   await prisma.deposit.delete({ where: { id: deposits[1].id .} });
  //   await prisma.player.delete({ where: { id: player.id } });
  prisma.$disconnect();
}
