import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { JWTPayload, TokenPair } from "@/types/response/jwt";
import CONFIG from "@/config";
/**
 * Generates and verifies Json Web Tokens
 */
export class JwtService {
  protected fingerprintCookie!: string;
  protected userFingerprintSha256!: string;

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
   * Verify a token and return its payload
   */
  verifyToken(
    token: string,
    pass: string,
  ): Promise<string | JWTPayload | undefined> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, pass, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded as string | JWTPayload | undefined);
      });
    });
  }

  /**
   * Generate token pair
   * @param sub User ID
   */
  generateTokenPair(sub: string, jti: string, pass: string): TokenPair {
    this.generateFingerprintCookie();
    return {
      access: this.generateAccessToken(pass, sub, jti),
      refresh: this.generateRefreshToken(pass, sub, jti),
    };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(pass: string, sub: string, jti: string): string {
    const token = jwt.sign(
      // Payload
      {
        sub,
        jti,
        type: "access",
        userFingerprint: this.userFingerprintSha256,
      },
      // Secret
      pass,
      // Options
      { expiresIn: CONFIG.AUTH.ACCESS_TOKEN_EXPIRE },
    );

    return token;
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(pass: string, sub: string, jti: string) {
    const token = jwt.sign(
      // Payload
      {
        sub,
        jti,
        type: "refresh",
        userFingerprint: this.userFingerprintSha256,
      },
      // Secret
      pass,
      // Options
      { expiresIn: CONFIG.AUTH.REFRESH_TOKEN_EXPIRE },
    );

    return token;
  }

  private generateFingerprintCookie() {
    let arr = new Uint8Array(50);
    arr = crypto.getRandomValues(arr);
    const binaryString = Array.from(arr, (byte) =>
      String.fromCodePoint(byte),
    ).join("");

    const userFingerprint = btoa(binaryString);
    const fingerprintCookie =
      CONFIG.AUTH.FINGERPRINT_COOKIE +
      "=" +
      userFingerprint +
      "; SameSite=Strict; HttpOnly; Secure; " +
      `Path=/app/${CONFIG.APP.VER}`;
    this.fingerprintCookie = fingerprintCookie;
    this.userFingerprintSha256 = createHash("sha256")
      .update(userFingerprint)
      .digest("hex");
  }
}
