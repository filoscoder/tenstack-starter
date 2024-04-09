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

export interface DepositRequest {
  tracking_number: string;
}

export interface CreateDepositProps extends DepositRequest {
  player_id: string;
}

export interface DepositUpdatableProps {
  dirty?: boolean;
  status?: string;
  tracking_number?: string;
  amount?: number;
}

export interface PaymentRequest {
  player_id: string;
  bank_account: string;
  amount: number;
  currency: string;
}

export interface PaymentUpdatableProps {
  bank_account?: string;
  amount?: number;
  currency?: string;
  paid?: string;
}
