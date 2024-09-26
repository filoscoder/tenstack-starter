import { PlayerServices } from "@/components/players/services";

export const mockGetBalance = jest.fn(async () => 420);
export function preparePlayerBalanceTest() {
  jest
    .spyOn(PlayerServices.prototype, "getBalance")
    .mockImplementation(mockGetBalance);
}
