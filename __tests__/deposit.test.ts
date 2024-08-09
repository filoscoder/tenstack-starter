import { BankAccount, Deposit, Player, PrismaClient } from "@prisma/client";
import { SuperAgentTest } from "supertest";
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "http-status";
import { initAgent } from "./helpers";
import { TokenPair } from "@/types/response/jwt";
import { AuthServices } from "@/components/auth/services";
import CONFIG, { COIN_TRANSFER_STATUS, DEPOSIT_STATUS } from "@/config";
import { DepositRequest } from "@/types/request/transfers";
import { PlayersDAO } from "@/db/players";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let players: (Player & { BankAccounts: BankAccount[] })[];
let depositRequests: DepositRequest[];
const tokens: TokenPair[] = [];
let agentAccessToken: TokenPair;
const deposits: Deposit[] = [];
let confirmedDeposit: Deposit;

beforeAll(initialize);
afterAll(cleanUp);

describe("[UNIT] => DEPOSIT", () => {
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
      ${"amount"}          | ${"invalid amount"}
      ${"date"}            | ${"invalid date"}
      ${"sending_bank"}    | ${"sending_bank is required"}
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

    it.each`
      field             | value           | message
      ${"amount"}       | ${"a"}          | ${"invalid amount"}
      ${"date"}         | ${"11-03-2024"} | ${"invalid date"}
      ${"sending_bank"} | ${123456}       | ${"invalid sending_bank"}
      ${"sending_bank"} | ${90420}        | ${"invalid sending_bank"}
    `("Should return 400 bad_request", async ({ field, value, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/transactions/deposit`)
        .send({
          ...depositRequests[0],
          [field]: value,
        })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe(message);
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

  describe("POST: /transactions/deposit/:id/set-status", () => {
    it("Should update a deposit", async () => {
      const response = await agent
        .post(
          `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[1].id}/set-status`,
        )
        .send({ status: DEPOSIT_STATUS.PENDING })
        .set("Authorization", `Bearer ${agentAccessToken.access}`);

      expect(response.status).toBe(OK);
      expect(response.body.data.status).toBe(DEPOSIT_STATUS.PENDING);
    });

    it("Should return 400 unknown_field", async () => {
      const response = await agent
        .post(
          `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}/set-status`,
        )
        .send({ status: DEPOSIT_STATUS.VERIFIED, unknown_field: 10 })
        .set("Authorization", `Bearer ${agentAccessToken.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 invalid status", async () => {
      const response = await agent
        .post(
          `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}/set-status`,
        )
        .send({ status: "invalid_status_value" })
        .set("Authorization", `Bearer ${agentAccessToken.access}`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("invalid status");
    });

    it("Should return 401", async () => {
      const response = await agent.post(
        `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}/set-status`,
      );

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("Should return 403", async () => {
      const response = await agent
        .post(
          `/app/${CONFIG.APP.VER}/transactions/deposit/${deposits[0].id}/set-status`,
        )
        .send({ status: DEPOSIT_STATUS.VERIFIED })
        .set("Authorization", `Bearer ${tokens[0].access}`);

      expect(response.status).toBe(FORBIDDEN);
    });

    it("Should return 404", async () => {
      const response = await agent
        .post(
          `/app/${CONFIG.APP.VER}/transactions/deposit/nonexistent/set-status`,
        )
        .send({ status: DEPOSIT_STATUS.VERIFIED })
        .set("Authorization", `Bearer ${agentAccessToken.access}`);

      expect(response.status).toBe(NOT_FOUND);
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
        "date",
        "sending_bank",
        "cep_ok",
        "coin_transfer_id",
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
      amount: 10,
      date: "2024-03-11T03:00:00.000Z",
      sending_bank: "90646",
    },
    {
      tracking_number: "test_tracking_number2" + Date.now(),
      amount: 1,
      date: "2024-03-11T03:00:00.000Z",
      sending_bank: "40138",
    },
  ];

  confirmedDeposit = await prisma.deposit.create({
    data: {
      status: DEPOSIT_STATUS.VERIFIED,
      Player: { connect: { id: players[0].id } },
      currency: "MXN",
      tracking_number: "test_tracking_number4" + Date.now(),
      amount: 0.01,
      sending_bank: "foo",
      date: new Date(),
      CoinTransfer: { create: { status: COIN_TRANSFER_STATUS.PENDING } },
    },
  });

  const agentUser = await PlayersDAO.getAgent();

  const authServices = new AuthServices();
  const auth1 = await authServices.tokens(players[0].id, "jest_test");
  const auth2 = await authServices.tokens(players[1].id, "jest_test");
  const auth3 = await authServices.tokens(agentUser!.id, "jest_test");
  tokens[0] = auth1.tokens;
  tokens[1] = auth2.tokens;
  agentAccessToken = auth3.tokens;
}

async function cleanUp() {
  try {
    await prisma.token.deleteMany({
      where: { user_agent: "jest_test" },
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
