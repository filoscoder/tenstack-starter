import { Deposit, PrismaClient } from "@prisma/client";
import CONFIG from "@/config";
import { DepositServices } from "@/components/deposits/services";

let service: DepositServices;
let prisma: PrismaClient;
let deposit: Deposit | null;
beforeAll(async () => {
  prisma = new PrismaClient();
  deposit = await prisma.deposit.findFirst({
    where: { tracking_number: "53771ALBO11032024195558814" },
  });

  if (!deposit) {
    const player = await prisma.player.findFirst();
    deposit = await prisma.deposit.create({
      data: {
        tracking_number: "53771ALBO11032024195558814",
        status: CONFIG.SD.DEPOSIT_STATUS.PENDING,
        player_id: player!.id,
      },
    });
  }

  service = new DepositServices();
});

describe("FinanceService", () => {
  describe("verifyPayment", () => {
    it("Should verify a payment", async () => {
      if (!deposit) fail("Deposit not found");

      const amount = await service.verify(deposit);

      expect(amount).toBeGreaterThan(0);
    });
  });
});
