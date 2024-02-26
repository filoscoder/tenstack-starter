export type TransferResult = {
  status: "COMPLETED" | "INCOMPLETE";
  sender_balance: number;
  recipient_balance?: number;
  error?: string;
};
