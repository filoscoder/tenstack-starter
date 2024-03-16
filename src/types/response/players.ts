import { BankAccount, Player, Role } from "@prisma/client";

export type PlayerResponse = {
  id: number;
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

export type RoledPlayer = Player & { roles: Role[] };

export type LoginResponse = {
  access: string;
  refresh: string;
  player: Player;
};