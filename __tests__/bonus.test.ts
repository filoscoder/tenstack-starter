import { SuperAgentTest } from "supertest";
import { Bonus, Player } from "@prisma/client";
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "http-status";
import { initAgent, testPrisma } from "./helpers";
import { generateAccessToken } from "./helpers/auth";
import {
  mockAgentToPlayer,
  prepareRedeemBonusTest,
} from "./mocks/bonus/redeem";
import CONFIG, { BONUS_STATUS, COIN_TRANSFER_STATUS } from "@/config";
import { BonusServices } from "@/components/bonus/services";

let agent: SuperAgentTest;
let pendingBonus: Bonus;
let playerAccessToken: string;
let player: Player;
let userCleanUp: () => Promise<any>;

beforeAll(initialize);

afterAll(cleanUp);

describe("[UNIT] => BONUS ROUTER", () => {
  const mockBonus: Bonus = {
    id: "foo",
    amount: 1,
    percentage: 100,
    player_id: "baz",
    status: BONUS_STATUS.ASSIGNED,
    coin_transfer_id: "bar",
    dirty: false,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const mockCreateBonus = jest.fn(async () => mockBonus);
  jest
    .spyOn(BonusServices.prototype, "create")
    .mockImplementation(mockCreateBonus);

  describe("POST /bonus", () => {
    it("Should create a bonus", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ player_id: player.id })
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(CREATED);
      expect(response.body.data.id).toBe("foo");
      expect(mockCreateBonus).toHaveBeenCalledTimes(1);
    });

    it("Should return 400 unknown_fields", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ foo: "bar", player_id: player.id })
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].type).toBe("unknown_fields");
    });

    it("Should return 400 invalid player id", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ player_id: "foo" })
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.body.data[0].msg).toBe("invalid player ID");
    });

    it("Should return 401", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/bonus`)
        .send({ player_id: player.id });

      expect(response.status).toBe(UNAUTHORIZED);
    });
  });

  describe("GET /bonus/:id/redeem", () => {
    beforeAll(() => prepareRedeemBonusTest());
    afterAll(jest.clearAllMocks);

    it("Should redeem a bonus", async () => {
      const response = await agent
        .get(`/app/${CONFIG.APP.VER}/bonus/${pendingBonus.id}/redeem`)
        .set("Authorization", "Bearer " + playerAccessToken);

      expect(response.status).toBe(OK);
      expect(response.body.data.bonus.status).toBe(BONUS_STATUS.REDEEMED);
      expect(response.body.data.coinTransfer.player_balance_after).toBe(1);
      expect(mockAgentToPlayer).toHaveBeenCalledTimes(1);
    });
  });
});
async function initialize() {
  agent = await initAgent();

  ({
    user: player,
    token: playerAccessToken,
    cleanUp: userCleanUp,
  } = await generateAccessToken(CONFIG.ROLES.PLAYER));

  pendingBonus = await testPrisma.bonus.create({
    data: {
      amount: 1,
      percentage: 100,
      Player: { connect: { id: player!.id } },
      status: BONUS_STATUS.PENDING,
      CoinTransfer: { create: { status: COIN_TRANSFER_STATUS.PENDING } },
    },
  });
}

async function cleanUp() {
  await testPrisma.bonus.delete({
    where: { id: pendingBonus.id },
  });
  await userCleanUp();
}
