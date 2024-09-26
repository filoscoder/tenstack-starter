export type BonusSettings = {
  percentage: number;
  amount: number;
};

export type CreateBonusProps = BonusSettings & {
  // coin_transfer_id?: string;
  player_id: string;
  status?: string;
};

export type BonusUpdatableProps = {
  amount?: number;
  status?: string;
  dirty?: boolean;
};
