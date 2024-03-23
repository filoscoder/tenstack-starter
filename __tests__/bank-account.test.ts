import { BAD_REQUEST, CREATED, FORBIDDEN, OK } from "http-status";
import { SuperAgentTest } from "supertest";
import { PrismaClient } from "@prisma/client";
import { initAgent } from "./helpers";
import CONFIG from "@/config";
import { BankAccountRequest } from "@/types/request/bank-account";

let agent: SuperAgentTest;
let prisma: PrismaClient;
let playerAccess: string;
let playerId: number;
let bankAccountRequest: BankAccountRequest;
let foreignBankAccountId: number;
let bankAccountId: number;

beforeAll(initialize);

afterAll(cleanUp);

describe("[UNIT] => BANK ACCOUNTS ROUTER", () => {
  it("Should create bank account", async () => {
    const response = await agent
      .post(`/app/${CONFIG.APP.VER}/bank-account`)
      .send({ ...bankAccountRequest })
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(CREATED);
    bankAccountId = response.body.data.id;
  });

  it("Should fail with error 'Unknown fields'", async () => {
    const response = await agent
      .post(`/app/${CONFIG.APP.VER}/bank-account`)
      .send({
        ...bankAccountRequest,
        unknownField: "test",
      })
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.body.details[0].type).toBe("unknown_fields");
  });

  it.each`
    field           | message
    ${"owner"}      | ${"Owner name is required"}
    ${"owner_id"}   | ${"Owner id is required"}
    ${"bankName"}   | ${"Bank name is required"}
    ${"bankNumber"} | ${"Bank number is required"}
  `(
    "Should fail with error 'Field is required'",
    async ({ field, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bank-account`)
        .send({
          owner: "Test " + Date.now(),
          owner_id: playerId,
          bankName: "Test Bank " + Date.now(),
          bankNumber: `${Date.now()}`,
          [field]: undefined,
        })
        .set("Authorization", `Bearer ${playerAccess} `);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.details[0].msg).toBe(message);
      expect(response.body.details[0].path).toBe(field);
    },
  );

  it("Should update bank account", async () => {
    const response = await agent
      .put(`/app/${CONFIG.APP.VER}/bank-account/${bankAccountId}`)
      .send({ owner: "Juancete" })
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(OK);
    expect(response.body.data.owner).toBe("Juancete");
  });

  it("Should NOT update bank account ID", async () => {
    const response = await agent
      .put(`/app/${CONFIG.APP.VER}/bank-account/${bankAccountId}`)
      .send({ id: 1 })
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(BAD_REQUEST);
  });

  it("Should NOT update someone else's bank account", async () => {
    const response = await agent
      .put(`/app/${CONFIG.APP.VER}/bank-account/${foreignBankAccountId}`)
      .send({ owner: "Carlitos" })
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(FORBIDDEN);
  });

  it("Should return bank account details", async () => {
    const response = await agent
      .get(`/app/${CONFIG.APP.VER}/bank-account/${bankAccountId}`)
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(OK);
    expect(response.body.data.length).toBe(1);
    expect(Object.keys(response.body.data[0])).toStrictEqual([
      "id",
      "owner",
      "owner_id",
      "player_id",
      "bankName",
      "bankNumber",
      "bankAlias",
      "created_at",
      "updated_at",
    ]);
  });

  it("Should NOT disclose someone else's bank account details", async () => {
    const response = await agent
      .get(`/app/${CONFIG.APP.VER}/bank-account/${foreignBankAccountId}`)
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(FORBIDDEN);
  });

  it("Should NOT delete someone else's bank account", async () => {
    const response = await agent
      .delete(`/app/${CONFIG.APP.VER}/bank-account/${foreignBankAccountId}`)
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(FORBIDDEN);
  });

  it("Should delete bank account", async () => {
    const response = await agent
      .delete(`/app/${CONFIG.APP.VER}/bank-account/${bankAccountId}`)
      .set("Authorization", `Bearer ${playerAccess} `);

    expect(response.status).toBe(OK);
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();

  const loginResponse = await agent
    .post(`/app/${CONFIG.APP.VER}/players/login`)
    .send({
      username: "test19",
      password: "1234",
    });

  playerAccess = loginResponse.body.data.access;
  playerId = loginResponse.body.data.player.id;

  bankAccountRequest = {
    owner: "Test " + Date.now(),
    owner_id: playerId,
    bankName: "Test Bank " + Date.now(),
    bankNumber: `${Date.now()}`,
    bankAlias: `${Date.now()}`,
  };

  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      NOT: { player_id: playerId },
    },
  });
  foreignBankAccountId = bankAccount?.id || 0;
}

async function cleanUp() {
  if (bankAccountId)
    prisma.bankAccount.delete({ where: { id: bankAccountId } });
  prisma.$disconnect();
}
