export type getPlayerId = string;

export interface getPlayerIdRequest extends Res {
  params: {
    id: getPlayerId;
  };
}

export interface PlayerRequest {
  username: string;
  password: string;
  panel_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  movile_number?: string;
  country?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface PlayerUpdatableProps {
  password: string;
}
