import { Telegram } from "@/notification/telegram";

export function prepareDepositTest() {
  const mockNotif = jest.fn();
  jest.spyOn(Telegram, "arturito").mockImplementation(mockNotif);
}
