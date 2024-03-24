/** Datos que recibe nuestra API */
export type TransferRequest = {
  amount: number;
  currency: string;
  bank_account: number;
};

/** Datos para API del casino */
export type TransferDetails = {
  recipient_id: number;
  sender_id: number;
  amount: number;
  currency: string;
  type: "deposit" | "withdrawal";
};

export interface DepositRequest {
  currency: string;
  tracking_number: string;
  paid_at: string;
}

export interface CreateDepositProps extends DepositRequest {
  player_id: number;
}

export interface DepositUpdatableProps {
  player_id?: number;
  dirty?: boolean;
  status?: string;
  tracking_number?: string;
  coins_transfered?: string;
  paid_at?: string;
  amount?: number;
}

export interface PaymentRequest {
  player_id: number;
  bank_account: number;
  amount: number;
  currency: string;
}

export interface PaymentUpdatableProps {
  bank_account?: number;
  amount?: number;
  currency?: string;
  paid?: string;
}
