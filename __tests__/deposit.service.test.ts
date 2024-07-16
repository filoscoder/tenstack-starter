import { Deposit, PrismaClient } from "@prisma/client";
import CONFIG from "@/config";
import { DepositServices } from "@/components/deposits/services";

let service: DepositServices;
let prisma: PrismaClient;
let deposit: Deposit | null;
beforeAll(async () => {
  prisma = new PrismaClient();
  service = new DepositServices();
  deposit = await prisma.deposit.findFirst({
    where: { tracking_number: "53771ALBO11032024195558814" },
  });

  if (deposit) return;

  const player = await prisma.player.findFirst();
  if (!player) throw new Error("Player not found");

  deposit = await prisma.deposit.create({
    data: {
      tracking_number: "53771ALBO11032024195558814",
      status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
      player_id: player.id,
      amount: 10,
      date: "2024-03-11T03:00:00.000Z",
      sending_bank: "90646",
    },
  });
});

describe("FinanceService", () => {
  describe("verifyPayment", () => {
    it("Should verify a payment", async () => {
      if (!deposit) fail("Deposit not found");

      const amount = await service.verifyThroughBanxico(deposit);

      expect(amount).toBeGreaterThan(0);
    });
  });
});
