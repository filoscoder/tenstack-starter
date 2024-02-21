export interface BankAccountRequest {
  name: string;
  number: string;
}

export interface AccountUpdateRequest extends BankAccountRequest {
  account_id: number;
}
