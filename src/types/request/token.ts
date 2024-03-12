export interface TokenUpdatableProps {
  invalid?: boolean;
  next?: string;
}

export interface CreateTokenDetails {
  player_id: number;
  user_agent?: string;
}

export interface TokenLookUpBy {
  id?: string;
  invalid?: boolean;
  next?: string;
  player_id?: number;
  user_agent?: string;
}
