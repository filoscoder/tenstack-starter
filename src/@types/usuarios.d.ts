declare module "usuarios" {
  type LoginResponse = {
    username: string;
    access: string;
    refresh: string;
    id: number;
  };

  type LoginRequest = {
    username: string;
    password: string;
  };

  type PlayerDetails = {
    username: string;
    password: string;
    panel_id: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    movile_number?: string;
    country?: string;
  };
}
