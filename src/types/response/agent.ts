/**
 * Response from casino
 */
export type LoginResponse = {
  username: string;
  access: string;
  refresh: string;
  id: number;
};

export type AgentBankAccount = {
  name: string;
  dni: string;
  bankName: string;
  accountNumber: string;
  clabe: string;
  alias: string;
};

export type BalanceResponse = {
  balance: number;
};
