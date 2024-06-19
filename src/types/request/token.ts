export interface TokenUpdatableProps {
  invalid?: boolean;
  next?: string;
}

export interface CreateTokenDetails {
  player_id: string;
}

export interface TokenLookUpBy {
  id?: string;
  invalid?: boolean;
  next?: string;
  player_id?: string;
}
