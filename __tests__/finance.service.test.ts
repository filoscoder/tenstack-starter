import { Deposit, PrismaClient } from "@prisma/client";
import { FinanceServices } from "@/components/transactions/services";
import CONFIG from "@/config";

let service: FinanceServices;
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

  service = new FinanceServices();
});

describe("FinanceService", () => {
  describe("verifyPayment", () => {
    it("Should verify a payment", async () => {
      if (!deposit) fail("Deposit not found");

      const amount = await service.verifyPayment(deposit);

      expect(amount).toBeTruthy();
    });
  });
});
