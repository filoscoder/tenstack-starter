import { BankAccountsDAO } from "@/db/bank-accounts";
import { BankAccountRequest } from "@/types/request/bank-account";

export class BankAccountServices {
  async index(player_id: string) {
    return await BankAccountsDAO.index(player_id);
  }

  async show(account_id: string, player_id: string) {
    return await BankAccountsDAO.show(account_id, player_id);
  }

  async create(player_id: string, request: BankAccountRequest) {
    return await BankAccountsDAO.create(player_id, request);
  }

  async update(
    account_id: string,
    player_id: string,
    request: BankAccountRequest,
  ) {
    return await BankAccountsDAO.update(account_id, player_id, request);
  }

  async delete(account_id: string, player_id: string) {
    return await BankAccountsDAO.delete(account_id, player_id);
  }
}
