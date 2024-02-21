import { BankAccount, Player } from "@prisma/client";

export type PlayerResponse = {
  id: number;
  panel_id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  movile_number?: string;
  country?: string;
  bank_accounts?: BankAccount[];
  balance_currency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PlainPlayerResponse = Player;
