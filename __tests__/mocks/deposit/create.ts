import { Telegram } from "@/notification/telegram";

export const mockNotifDepositStatus = jest.fn();

export function prepareDepositTest() {
  jest.spyOn(Telegram, "arturito").mockImplementation(mockNotifDepositStatus);
}
