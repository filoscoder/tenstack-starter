export type BonusSettings = {
  percentage: number;
  amount: number;
};

export type CreateBonusProps = BonusSettings & {
  player_id: string;
  coin_transfer_id: string;
  status?: string;
};

export type BonusUpdatableProps = {
  amount?: number;
  status: string;
};
