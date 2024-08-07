import { Deposit } from "@prisma/client";
import { BanxicoService } from "@/services/banxico.service";

describe("[UNIT] => Banxico Service", () => {
  const realDeposit: Deposit = {
    amount: 10,
    sending_bank: "90646",
    currency: "MXN",
    date: new Date("03-11-2024"),
    dirty: false,
    tracking_number: "53771ALBO11032024195558814",
    cep_ok: false,
    id: "abc",
    status: "foo",
    player_id: "",
    created_at: new Date(),
    updated_at: new Date(),
  };
  const fakeDeposit: Deposit = {
    amount: 100,
    sending_bank: "90646",
    currency: "MXN",
    date: new Date("03-11-2024"),
    dirty: false,
    tracking_number: "sarasa",
    cep_ok: false,
    id: "abc",
    status: "foo",
    player_id: "",
    created_at: new Date(),
    updated_at: new Date(),
  };
  const banxicoService = new BanxicoService();

  it("Should find a deposit's bank account", async () => {
    const bank = await banxicoService.findBank(realDeposit);

    expect(bank).toBe("90646");
  }, 200000);

  it("Should successfuly query a deposit", async () => {
    // @ts-ignore
    const queryResult = await banxicoService.queryDepositStatus(realDeposit);
    expect(
      queryResult?.includes(
        "Con la información proporcionada se identificó el siguiente pago",
      ),
    ).toBe(true);
  });

  it("Should successfuly query a fake deposit", async () => {
    // @ts-ignore
    const queryResult = await banxicoService.queryDepositStatus(fakeDeposit);
    expect(queryResult).toBe(undefined);
  });
});
