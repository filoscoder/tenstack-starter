import { Cashier } from "@prisma/client";
import { AuthServices } from "@/components/auth/services";
import { CashierServices } from "@/components/cashier/services";
import { PlayerServices } from "@/components/players/services";
import { mockPlayer } from "@/config/mockPlayer";
import { Whatsapp } from "@/notification/whatsapp";

export const mockCashier: Cashier = {
  id: "cashier_id",
  access: "access_token",
  refresh: "refresh_token",
  dirty: false,
  username: "foo",
  password: "baz",
  handle: "@foo",
  panel_id: -69,
  last_cashout: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockCreateCasinoPlayer = jest.fn(async () => -420);
export const mockSend = jest.fn();
const mockCreateLocalPlayer = jest.fn(async (...args: any) => ({
  ...mockPlayer,
  cashier_id: args[1]?.cashier_id,
  panel_id: args[0],
}));
const mockCreateCashier = jest.fn(async () => mockCashier);
const mockTokens = jest.fn(async () => ({
  tokens: { access: "access_token", refresh: "refresh_token" },
  jti: "eggs",
}));

export function preparePlayerTest() {
  jest
    .spyOn((PlayerServices as any).prototype, "findAgent")
    .mockResolvedValue(mockCashier);

  jest
    .spyOn((PlayerServices as any).prototype, "createCasinoPlayer")
    .mockImplementation(mockCreateCasinoPlayer);

  jest.spyOn(Whatsapp, "send").mockImplementation(mockSend);

  jest
    .spyOn((PlayerServices as any).prototype, "createLocalPlayer")
    .mockImplementation(mockCreateLocalPlayer);

  jest.spyOn(AuthServices.prototype, "tokens").mockImplementation(mockTokens);

  jest
    .spyOn(CashierServices.prototype, "create")
    .mockImplementation(mockCreateCashier);
}
