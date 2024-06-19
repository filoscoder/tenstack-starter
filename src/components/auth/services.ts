import { createHash } from "crypto";
import jwtStrategy, { StrategyOptions } from "passport-jwt";
import { Token } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtService } from "../../services/jwt.service";
import CONFIG from "@/config";
import { TokenDAO } from "@/db/token";
import { JWTPayload, TokenPair, TokenResult } from "@/types/response/jwt";
import { PlayersDAO } from "@/db/players";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";

export class AuthServices extends JwtService {
  private get cypherPass(): string {
    const secret = CONFIG.APP.CYPHER_PASS;
    if (!secret) {
      throw new CustomError({
        status: 500,
        code: "variables_entorno",
        description: "No se encontró CYPHER_PASS en .env",
      });
    }
    return secret;
  }

  /**
   * Generate access/refresh pair and link them to DB object
   * @param sub User ID
   * @param role User role
   */
  async tokens(sub: string): Promise<TokenResult> {
    const dbToken = await TokenDAO.create({ player_id: sub });
    return {
      tokens: this.generateTokenPair(sub, dbToken.id, this.cypherPass),
      fingerprintCookie: this.fingerprintCookie,
      jti: dbToken.id,
    };
  }

  /**
   * Generate new pair from refresh token
   */
  async refresh(refresh: string, req: Req): Promise<TokenPair> {
    if (!this.verifyTokenExpiration(refresh))
      throw new CustomError(ERR.TOKEN_EXPIRED);

    const payload = await this.verifyToken(refresh, this.cypherPass);
    if (!payload || typeof payload === "string")
      throw new CustomError(ERR.TOKEN_INVALID);

    if (payload.type !== "refresh") throw new CustomError(ERR.WRONG_TOKEN_TYPE);

    const token = await TokenDAO.getById(payload.jti);
    if (!token) throw new CustomError(ERR.TOKEN_INVALID);

    this.validateFingerprint(req, payload.userFingerprint);

    if (token.invalid) {
      await this.invalidateChildren(token);
      throw new CustomError(ERR.TOKEN_INVALID);
    }

    const { tokens, jti } = await this.tokens(payload.sub);
    // Invalidate received token and link it to newly created one.
    await TokenDAO.updateById(token.id, { invalid: true, next: jti });
    return tokens;
  }

  /**
   * Configure the JWT strategy for passport
   * @returns Strategy
   */
  jwtStrategy() {
    const options: StrategyOptions = {
      secretOrKey: this.cypherPass,
      jwtFromRequest: jwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    };

    return new jwtStrategy.Strategy(options, this.deserialize);
  }

  private deserialize: jwtStrategy.VerifyCallbackWithRequest = async (
    request: Req,
    payload: JWTPayload,
    done: jwtStrategy.VerifiedCallback,
  ) => {
    try {
      this.validateFingerprint(request, payload.userFingerprint);
    } catch (error) {
      return done(error, false);
    }

    const token = await TokenDAO.getById(payload.jti);

    if (!token || token.invalid || payload.type !== "access")
      return done(new CustomError(ERR.TOKEN_INVALID), false);

    const user = await PlayersDAO._getById(payload.sub);
    return done(null, user);
  };

  private validateFingerprint(request: Req, userFingerprint: string): void {
    if (CONFIG.APP.ENV === "test") return;
    if (
      !request.cookies ||
      request.cookies.length === 0 ||
      !(CONFIG.AUTH.FINGERPRINT_COOKIE in request.cookies)
    )
      // TODO
      // use UnauthorizedError
      throw new CustomError(ERR.FINGERPRINT_COOKIE_NOT_FOUND);

    const cookie = request.cookies[CONFIG.AUTH.FINGERPRINT_COOKIE];
    const hash = createHash("sha256").update(cookie).digest("hex");

    if (hash !== userFingerprint)
      // TODO
      // use UnauthorizedError
      throw new CustomError(ERR.INVALID_FINGERPRINT);
  }

  private invalidateTokenById(token_id: string) {
    return TokenDAO.updateById(token_id, { invalid: true });
  }

  /**
   * Invalidate given token and all its children
   */
  private async invalidateChildren(token: Token) {
    await this.invalidateTokenById(token.id);
    while (token!.next) {
      token = await this.invalidateTokenById(token.next);
    }
  }

  async logout(user_id: string, encoded: string) {
    try {
      const payload = jwt.verify(encoded, this.cypherPass) as JwtPayload;
      if (payload === undefined) return;
      const token = await TokenDAO.authorizeRevocation(
        user_id,
        payload.jti as string,
      );
      await this.invalidateChildren(token);
    } catch (error: any) {
      if (error.name && error.name === "TokenExpiredError") return;
      throw error;
    }
  }
}
