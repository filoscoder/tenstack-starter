import { Deposit } from "@prisma/client";
import { BanxicoService } from "@/services/banxico.service";

describe("[UNIT] => Banxico Service", () => {
  it("Should find a deposit's bank account", async () => {
    const deposit: Deposit = {
      amount: 10,
      sending_bank: "-1",
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

    const banxicoService = new BanxicoService();
    // @ts-ignore
    const bank = await banxicoService.findBank(deposit);

    expect(bank).toBe("90646");
  }, 200000);
});
