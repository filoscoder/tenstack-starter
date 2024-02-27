import { AgentBankAccount } from "../response/agent";

export interface RootUpdatableProps {
  username?: string;
  password?: string;
  panel_id?: number;
  access?: string;
  refresh?: string;
  json_response?: string;
  dirty?: boolean;
  bankAccount?: AgentBankAccount;
}

export interface RootRequest {
  username: string;
  password: string;
  panel_id: number;
  access: string;
  refresh: string;
  json_response: string;
  dirty: boolean;
}
