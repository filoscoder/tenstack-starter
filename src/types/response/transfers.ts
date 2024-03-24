export type CoinTransferResult = {
  status: "COMPLETED" | "INCOMPLETE";
  player_balance?: number;
  error?: string;
};
