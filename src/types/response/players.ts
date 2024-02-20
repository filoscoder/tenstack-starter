export type Player = {
  id: number;
  panel_id: number;
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  movile_number?: string;
  country?: string;
  // BankAccounts      BankAccount[]
  balance_currency: string;
  status: string;
  // Payments          Payment[]
  // Deposits          Deposit[]
  created_at: string;
  updated_at: string;
};
