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
}
