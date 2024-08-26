import { PLAYER_STATUS } from "@/config";

export type getPlayerId = string;

export type PlayerRequest = {
  username: string;
  password: string;
  handle?: string;
  panel_id: number;
  email: string;
  roles: string[];
  cashier_id?: string;
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
  password?: string;
  email?: string;
  movile_number?: string;
  first_name?: string;
  last_name?: string;
  status?: PLAYER_STATUS;
};

export type PlayerUpdateRequest = {
  email?: string;
  movile_number?: string;
  first_name?: string;
  last_name?: string;
  status?: PLAYER_STATUS;
};

export type OrderBy<T> = {
  [key in keyof T]?: "asc" | "desc";
};
