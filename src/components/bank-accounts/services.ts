import { BankAccountsDAO } from "@/db/bank-accounts";
import { BankAccountRequest } from "@/types/request/bank-account";

export class BankAccountServices {
  async index(player_id: number) {
    return await BankAccountsDAO.index(player_id);
  }

  async show(account_id: number) {
    return await BankAccountsDAO.show(account_id);
  }

  async create(player_id: number, request: BankAccountRequest) {
    return await BankAccountsDAO.create(player_id, request);
  }

  async update(
    account_id: number,
    player_id: number,
    request: BankAccountRequest,
  ) {
    return await BankAccountsDAO.update(account_id, player_id, request);
  }

  async delete(account_id: number, player_id: number) {
    return await BankAccountsDAO.delete(account_id, player_id);
  }
}
