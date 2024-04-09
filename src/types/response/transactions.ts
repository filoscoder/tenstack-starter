/**
 * Transaction History entry
 */
export type Transaction = {
  ok: boolean;
  sender_id: number;
  recipient_id: number;
  amount: number;
  date: string;
};
