export type getPlayerId = string;

export type PlayerRequest = {
  username: string;
  password: string;
  panel_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  movile_number?: string;
  country?: string;
};

export type Credentials = {
  username: string;
  password: string;
};

export type PlayerUpdatableProps = {
  password: string;
};
