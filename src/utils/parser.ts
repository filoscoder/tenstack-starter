import { PlayerResponse } from "@/types/response/players";

export const parsePlayer = (playerDB: any): PlayerResponse | null => {
  return !playerDB
    ? null
    : {
        id: playerDB.id,
        // panel_id: playerDB.panel_id,
        username: playerDB.username,
        email: playerDB.email,
        first_name: playerDB.first_name,
        last_name: playerDB.last_name,
        date_of_birth: playerDB.date_of_birth,
        movile_number: playerDB.movile_number,
        country: playerDB.country,
        bank_accounts: playerDB.BankAccounts,
        balance_currency: playerDB.balance_currency,
        status: playerDB.status,
        created_at: playerDB.created_at,
        updated_at: playerDB.updated_at,
      };
};
