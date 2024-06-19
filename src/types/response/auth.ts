import { LoginResponse } from "./players";

export type AuthResult = {
  loginResponse: LoginResponse;
  fingerprintCookie: string;
};
