declare module "transactions" {
  /** Datos recibidos desde el front */
  type TransferRequest = {
    // username: string;
    // password: string;
    amount: number;
    currency: string;
    bank_account: number; // ID de cuenta bancaria
  };

  /** Datos para API del casino */
  type TransferDetails = {
    recipient_id: number;
    sender_id: number;
    amount: number;
    currency: string;
  };

  type TransferResult = {
    status: "COMPLETED" | "INCOMPLETE";
    sender_balance: number;
    recipient_balance?: number;
    error?: string;
  };

  type Transaction = {
    status: "COMPLETED" | "INCOMPLETE";
    sender_id: number; // Panel id
    recipient_id: number; // Panel id
    amount: number;
    date: string;
  };

  type BankAccount = {
    id: number;
    owner: string;
    owner_id: number;
    player_id: number;
    bankName: string;
    bankNumber: string;
    bankAlias?: string;
    created_at: string;
    updated_at: string;
  };
}
