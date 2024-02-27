export type TransferResult = {
  status: "COMPLETED" | "INCOMPLETE";
  player_balance?: number;
  error?: string;
};
