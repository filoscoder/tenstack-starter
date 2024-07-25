export type CreateBonusProps = {
  percentage: number;
  amount: number;
  player_id: string;
  status?: string;
};

export type BonusUpdatableProps = {
  amount?: number;
  status: string;
};
