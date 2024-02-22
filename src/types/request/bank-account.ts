export interface BankAccountRequest {
  owner: string;
  owner_id: number;
  bankName: string;
  bankNumber: string;
  bankAlias: string | null;
}

export interface AccountUpdateRequest extends BankAccountRequest {
  account_id: number;
}
