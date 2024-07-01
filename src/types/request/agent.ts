import { AgentBankAccount } from "../response/agent";

export type UserRootUpdatableProps = {
  bankAccount: AgentBankAccount;
  bot_phone: string;
  human_phone: string;
};
