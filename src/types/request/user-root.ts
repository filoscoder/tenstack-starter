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
  alq_api_manager?: string;
  alq_token?: string;
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
