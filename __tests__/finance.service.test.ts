import { Deposit, PrismaClient } from "@prisma/client";
import { FinanceServices } from "@/components/transactions/services";

let service: FinanceServices;
let prisma: PrismaClient;
let deposit: Deposit;
beforeAll(async () => {
  prisma = new PrismaClient();
  deposit = (await prisma.deposit.findUnique({
    where: { tracking_number: "53771ALBO11032024195558814" },
  })) as Deposit;

  if (!deposit) throw new Error("Deposit not found");

  service = new FinanceServices();
});

describe("FinanceService", () => {
  describe("verifyPayment", () => {
    it("Should verify a payment", async () => {
      const verified = await service.verifyPayment(deposit);

      expect(verified.amount).toBeTruthy();
    });
  });
});
