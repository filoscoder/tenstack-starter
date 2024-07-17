import { AgentBankAccount } from "../response/agent";

export type RootUpdatableProps = {
  username?: string;
  password?: string;
  panel_id?: number;
  access?: string;
  refresh?: string;
  json_response?: string;
  dirty?: boolean;
  bankAccount?: AgentBankAccount;
  alq_api_manager?: string;
  alq_token?: string;
};

export type RootRequest = {
  username: string;
  password: string;
  panel_id: number;
  access: string;
  refresh: string;
  json_response: string;
  dirty: boolean;
};

export type RootBankAccount = {
  name: string;
  dni: string;
  bankId: string;
  accountNumber: string;
  clabe: string;
  alias: string;
};
