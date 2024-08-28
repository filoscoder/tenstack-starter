import { CashierServices } from "@/components/cashier/services";
import { GeneralReport } from "@/types/response/cashier";

export function prepareGeneralReportTest() {
  const mockGeneralReport: GeneralReport = {
    total: {
      bets_count: 1,
      total_bets: "2",
      total_profit: "0",
      total_wins: "0",
    },
    providers: [
      {
        bets_count: 1,
        total_bets: "2",
        total_profit: "0",
        total_wins: "0",
        producer: "foo",
      },
    ],
  };
  jest
    .spyOn(CashierServices.prototype, "playerGeneralReport")
    .mockResolvedValue(mockGeneralReport);
}
