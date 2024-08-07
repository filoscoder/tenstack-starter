/** Datos que recibe nuestra API */
export type CashoutRequest = {
  amount: number;
  bank_account: string;
};

/** Datos para API del casino */
export type TransferDetails = {
  recipient_id: number;
  sender_id: number;
  amount: number;
  currency: string;
  type: "deposit" | "cashout";
};

export type DepositRequest = {
  tracking_number: string;
  date: string; // ISO-8601
  sending_bank: string;
  amount: number;
};
export type CreateDepositProps = DepositRequest & {
  player_id: string;
  coin_transfer_id: string;
  cep_ok?: boolean;
};

export type SetDepositStatusRequest = {
  status: "pending" | "unverified" | "verified" | "deleted";
};

export type DepositUpdatableProps = {
  dirty?: boolean;
  status?: string;
  tracking_number?: string;
  amount?: number;
  cep_ok?: boolean;
  sending_bank?: string;
};

export type PaymentRequest = {
  player_id: string;
  bank_account: string;
  amount: number;
  currency: string;
};

export type PaymentUpdatableProps = {
  bank_account?: string;
  amount?: number;
  currency?: string;
  status?: string;
  dirty?: boolean;
  alquimia_id?: number;
};
