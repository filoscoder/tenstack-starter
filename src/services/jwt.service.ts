import jwt from "jsonwebtoken";
import { JWTPayload, TokenPair } from "@/types/response/jwt";
/**
 * Generates and verifies Json Web Tokens
 */
export class JwtService {
  /**
   * Verificar si el token está expirado
   * @param token the token to check
   * @returns true for valid token, false for expired token
   */
  verifyTokenExpiration(token: string): boolean {
    try {
      const payload = this.decodePayload(token);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      return !(Number(payload.exp) < currentTimeInSeconds + 10);
    } catch (error) {
      return false;
    }
  }

  decodePayload(token: string): JWTPayload {
    const bufer = Buffer.from(token.split(".")[1], "base64");
    const payloadJson = bufer.toString("utf8");
    return JSON.parse(payloadJson);
  }

  /**
   * Generate token pair
   * @param sub User ID
   * @param role User role ("player" | "agent")
   */
  generateTokenPair(sub: number, jti: string, pass: string): TokenPair {
    return {
      access: this.generateAccessToken(pass, sub, jti),
      refresh: this.generateRefreshToken(pass, sub, jti),
    };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(pass: string, sub: number, jti: string): string {
    const token = jwt.sign(
      // Payload
      { sub, jti, type: "access" },
      // Secret
      pass,
      // Options
      { expiresIn: "10m" },
    );

    return token;
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(pass: string, sub: number, jti: string) {
    const token = jwt.sign(
      // Payload
      { sub, jti, type: "refresh" },
      // Secret
      pass,
      // Options
      { expiresIn: "8h" },
    );

    return token;
  }
}
