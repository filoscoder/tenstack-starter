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
};
