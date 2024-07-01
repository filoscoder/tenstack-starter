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

/** Casino response to /pyramid/certain-user/:userId */
export type CertainUserResponse = {
  id: number;
  is_email_verified: false;
  info: {
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    mobile_number: string;
    country: string;
    city: string;
    street_address: string;
    postal_code: string;
    state: string | null;
    screen_name: string;
  };
  bonus_balance: string;
  balance: string;
  role: string;
  email: string;
  is_withdraw_allowed: boolean;
  is_banned: boolean;
  is_frozen: boolean;
  social_links: string[];
  agent_info: null;
  last_login: null;
  username: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  balance_currency: string;
  bonus_balance_currency: string;
  is_self_registered: boolean;
  language: string;
  needs_document_approve: boolean;
  affise_data: null;
  pap_data: null;
  cpf_document: null;
  parent: number;
};
