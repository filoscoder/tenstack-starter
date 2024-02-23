/**
 * Transaction History entry
 */
export type Transaction = {
  status: "COMPLETED" | "INCOMPLETE";
  sender_id: number;
  recipient_id: number;
  amount: number;
  date: string;
};
