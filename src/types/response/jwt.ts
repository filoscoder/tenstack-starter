export interface JWTPayload {
  sub: string;
  jti: string;
  type: "access" | "refresh";
  exp: number;
  iat: number;
  userFingerprint: string;
}

export interface TokenResult {
  tokens: TokenPair;
  jti: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}
